import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from assignments.models import Assignment, AssignmentSubmission
from courses.models import Course, CourseModule
from enrollments.models import Enrollment

# enrich_course_content.py already upgrades every course's one seeded
# assignment to a real "Applied Project" per category. This adds a second,
# lighter assignment tied to a specific module so there's more than one
# assignment per course to test with (grading queue, pagination, per-module
# assignment lists, etc.) — generic on purpose since it doesn't need
# category-specific content the way the main project assignment does.
CHECKPOINT_TITLE_PREFIX = 'Module Checkpoint:'


class Command(BaseCommand):
    help = (
        "Adds a second, lighter 'Module Checkpoint' assignment to every course (tied to one "
        "of its modules), with a few simulated student submissions for grading-queue testing. "
        "Safe to re-run — skips courses that already have a checkpoint assignment."
    )

    def add_arguments(self, parser):
        parser.add_argument('--course-id', type=int, help='Only enrich this course id (for testing).')
        parser.add_argument('--limit', type=int, help='Only enrich the first N matching courses.')

    def handle(self, *args, **options):
        courses = Course.objects.filter(status=Course.Status.PUBLISHED).select_related('instructor').order_by('id')
        if options.get('course_id'):
            courses = courses.filter(id=options['course_id'])
        if options.get('limit'):
            courses = courses[: options['limit']]

        created = 0
        submissions_created = 0
        for course in courses:
            with transaction.atomic():
                assignment = self.add_checkpoint(course)
                if assignment:
                    created += 1
                    submissions_created += self.seed_submissions(assignment)

        self.stdout.write(self.style.SUCCESS(
            f'Checkpoint assignments created: {created}\nSubmissions created: {submissions_created}'
        ))

    def add_checkpoint(self, course):
        if Assignment.objects.filter(course=course, title__startswith=CHECKPOINT_TITLE_PREFIX).exists():
            return None

        modules = list(CourseModule.objects.filter(unit__course=course).order_by('unit__order', 'order'))
        if not modules:
            return None
        module = modules[len(modules) // 2]

        return Assignment.objects.create(
            course=course,
            module=module,
            title=f'{CHECKPOINT_TITLE_PREFIX} {module.title}',
            description=f"A short check-in assignment covering what you've learned so far in {module.title}.",
            instructions=(
                f"Write a short (200-400 word) reflection on {module.title}:\n\n"
                "- What was the most useful idea from this module, and why?\n"
                "- Describe one way you could apply it in a real situation.\n"
                "- Note anything you're still unsure about, so your instructor can follow up.\n\n"
                "Submit your reflection as text below."
            ),
            maximum_marks=50,
            passing_marks=25,
            due_date=timezone.now() + timedelta(days=21),
            submission_type=Assignment.SubmissionType.TEXT,
            allow_late_submission=True,
            status=Assignment.Status.PUBLISHED,
            created_by=course.instructor,
        )

    def seed_submissions(self, assignment):
        enrolled_students = [
            e.student for e in Enrollment.objects.filter(course=assignment.course).select_related('student')
        ]
        if not enrolled_students:
            return 0

        rng = random.Random(f'checkpoint-{assignment.id}')
        submitters = rng.sample(enrolled_students, k=min(len(enrolled_students), rng.randint(1, 3)))

        created = 0
        for student in submitters:
            graded = rng.random() < 0.5
            marks = rng.choice([28, 32, 38, 42, 47]) if graded else None
            _, was_created = AssignmentSubmission.objects.get_or_create(
                assignment=assignment, student=student,
                defaults={
                    'submission_text': (
                        f"The most useful idea from {assignment.module.title} was how it connects to what I already "
                        "do day to day. I plan to start applying it in my next project and will keep track of "
                        "what works."
                    ),
                    'status': AssignmentSubmission.Status.GRADED if graded else AssignmentSubmission.Status.SUBMITTED,
                    'marks_awarded': marks,
                    'feedback': 'Thoughtful reflection — good specific example.' if graded else '',
                    'graded_by': assignment.course.instructor if graded else None,
                    'graded_at': timezone.now() if graded else None,
                },
            )
            if was_created:
                created += 1
        return created

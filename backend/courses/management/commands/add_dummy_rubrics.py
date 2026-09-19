import random

from django.core.management.base import BaseCommand
from django.db import transaction

from assignments.models import Assignment, AssignmentSubmission, Rubric, RubricCriterion
from courses.models import Course

# A small, reusable library of rubrics covering the assignment styles already
# seeded across courses (see enrich_course_content and add_module_assignments)
# — generic by design so the same rubric works across every category, rather
# than one bespoke rubric per course.
RUBRICS = [
    {
        'title': 'Applied Project Rubric',
        'description': 'General-purpose rubric for hands-on applied projects — used across the "Applied Project" assignments.',
        'criteria': [
            ('Requirements Met', 'Covers everything the brief asked for, with nothing important missing.', 30),
            ('Quality Of Work', 'The submission is well put together, correct, and functions/holds up as intended.', 30),
            ('Documentation & Explanation', 'Clearly explains what was built/done and the reasoning behind key decisions.', 25),
            ('Presentation', 'Organized, easy to follow, and free of careless errors.', 15),
        ],
    },
    {
        'title': 'Written Reflection Rubric',
        'description': 'For short reflective writing assignments — used across the "Module Checkpoint" assignments.',
        'criteria': [
            ('Clarity Of Thought', 'The main idea is clear and easy to follow from start to finish.', 20),
            ('Depth Of Reflection', 'Goes beyond surface-level summary to genuine personal insight.', 15),
            ('Use Of Examples', 'Backs up points with a specific, concrete example rather than vague generalities.', 10),
            ('Structure & Grammar', 'Well-organized paragraphs with minimal spelling/grammar issues.', 5),
        ],
    },
    {
        'title': 'Presentation Rubric',
        'description': 'For assignments submitted as a slide deck or recorded presentation.',
        'criteria': [
            ('Content Accuracy', 'The information presented is correct and directly relevant to the topic.', 35),
            ('Delivery & Clarity', 'Ideas are communicated clearly and at an appropriate pace.', 30),
            ('Visual Design', 'Slides/visuals support the content without being cluttered or distracting.', 20),
            ('Time Management', 'Stays within the expected length without rushing or padding.', 15),
        ],
    },
    {
        'title': 'Case Study Analysis Rubric',
        'description': 'For assignments asking students to analyze a real or simulated scenario.',
        'criteria': [
            ('Problem Identification', 'Correctly identifies the core issue(s) in the case.', 25),
            ('Analysis Depth', 'Goes beyond description to genuine analysis of causes and trade-offs.', 35),
            ('Recommendation Quality', 'Proposes a realistic, well-justified course of action.', 25),
            ('Structure', 'The write-up is organized in a way that is easy for a reader to follow.', 15),
        ],
    },
    {
        'title': 'Group Project Rubric',
        'description': 'For assignments completed collaboratively, evaluating both process and output.',
        'criteria': [
            ('Collaboration', 'Evidence of genuine teamwork rather than one person doing all the work.', 20),
            ('Individual Contribution', 'The student’s own contribution is clear and substantive.', 20),
            ('Final Deliverable Quality', 'The finished output meets the assignment’s requirements.', 40),
            ('Presentation Of Results', 'Findings/output are communicated clearly to the audience.', 20),
        ],
    },
    {
        'title': 'Research Report Rubric',
        'description': 'For assignments requiring independent research and a written report.',
        'criteria': [
            ('Research Quality', 'Draws on credible, relevant sources appropriate to the topic.', 30),
            ('Argument & Structure', 'Builds a coherent argument with a clear introduction, body, and conclusion.', 30),
            ('Use Of Evidence', 'Claims are backed by evidence rather than unsupported opinion.', 25),
            ('Writing Clarity', 'Well-written, concise, and free of major grammar issues.', 15),
        ],
    },
    {
        'title': 'Practical Exercise Rubric',
        'description': 'For short hands-on exercises where correctness and approach both matter.',
        'criteria': [
            ('Correctness', 'The exercise is completed correctly and produces the expected result.', 40),
            ('Approach & Method', 'Uses a sound, efficient approach rather than a fragile workaround.', 30),
            ('Explanation', 'Briefly explains the reasoning behind the approach taken.', 20),
            ('Presentation', 'Submission is tidy and easy for a grader to follow.', 10),
        ],
    },
]

# category_name -> Rubric title, used only where a category-specific rubric
# reads better than the generic "Applied Project Rubric".
CATEGORY_PROJECT_RUBRIC = {
    'Software Development': 'Practical Exercise Rubric',
    'Information Technology': 'Practical Exercise Rubric',
    'Data Science': 'Case Study Analysis Rubric',
    'Business': 'Case Study Analysis Rubric',
    'Accounting': 'Practical Exercise Rubric',
    'Digital Marketing': 'Group Project Rubric',
    'Languages': 'Presentation Rubric',
    'Professional Development': 'Research Report Rubric',
}

CHECKPOINT_RUBRIC_TITLE = 'Written Reflection Rubric'
DEFAULT_PROJECT_RUBRIC_TITLE = 'Applied Project Rubric'


class Command(BaseCommand):
    help = (
        "Seeds a small library of reusable dummy rubrics, attaches them to the existing "
        "'Applied Project' and 'Module Checkpoint' assignments (category-appropriate where "
        "sensible), and backfills a per-criterion rubric_scores breakdown on already-graded "
        "submissions so the grading UI has real data to test with. Safe to re-run."
    )

    def add_arguments(self, parser):
        parser.add_argument('--course-id', type=int, help='Only attach rubrics for this course id.')

    def handle(self, *args, **options):
        instructors = list(self.get_creators())
        rubrics_by_title = self.seed_rubrics(instructors)

        courses = Course.objects.filter(category__isnull=False).select_related('category')
        if options.get('course_id'):
            courses = courses.filter(id=options['course_id'])

        attached = 0
        submissions_backfilled = 0
        for course in courses:
            project_title = CATEGORY_PROJECT_RUBRIC.get(course.category.name, DEFAULT_PROJECT_RUBRIC_TITLE)
            for assignment in Assignment.objects.filter(course=course, rubric__isnull=True):
                if assignment.title.startswith('Module Checkpoint:'):
                    rubric = rubrics_by_title[CHECKPOINT_RUBRIC_TITLE]
                elif assignment.title.startswith('Applied Project:'):
                    rubric = rubrics_by_title[project_title]
                else:
                    continue

                with transaction.atomic():
                    assignment.rubric = rubric
                    assignment.save(update_fields=['rubric'])
                    attached += 1
                    submissions_backfilled += self.backfill_scores(assignment, rubric)

        self.stdout.write(self.style.SUCCESS(
            f'Rubrics in library: {len(rubrics_by_title)}\n'
            f'Assignments attached: {attached}\n'
            f'Submissions backfilled with rubric_scores: {submissions_backfilled}'
        ))

    def get_creators(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.filter(user_type__in=['instructor', 'academic_manager']).order_by('id')[:20]

    def seed_rubrics(self, instructors):
        rng = random.Random('dummy-rubrics')
        by_title = {}
        for spec in RUBRICS:
            rubric, created = Rubric.objects.get_or_create(
                title=spec['title'],
                defaults={
                    'description': spec['description'],
                    'created_by': rng.choice(instructors) if instructors else None,
                },
            )
            if created:
                for order, (title, desc, points) in enumerate(spec['criteria']):
                    RubricCriterion.objects.create(
                        rubric=rubric, title=title, description=desc, max_points=points, order=order,
                    )
            by_title[spec['title']] = rubric
        return by_title

    def backfill_scores(self, assignment, rubric):
        criteria = list(rubric.criteria.all())
        if not criteria:
            return 0

        updated = 0
        for submission in AssignmentSubmission.objects.filter(
            assignment=assignment, marks_awarded__isnull=False, rubric_scores={},
        ):
            rng = random.Random(f'rubric-backfill-{submission.id}')
            total_marks = float(submission.marks_awarded)
            total_max = sum(c.max_points for c in criteria) or 1
            scores = {}
            remaining = total_marks
            for i, criterion in enumerate(criteria):
                if i == len(criteria) - 1:
                    points = max(0, min(criterion.max_points, round(remaining)))
                else:
                    share = total_marks * (criterion.max_points / total_max)
                    jitter = rng.uniform(-0.1, 0.1) * criterion.max_points
                    points = max(0, min(criterion.max_points, round(share + jitter)))
                    remaining -= points
                scores[str(criterion.id)] = points
            submission.rubric_scores = scores
            submission.save(update_fields=['rubric_scores'])
            updated += 1
        return updated

import random

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.content_bank import CONCEPTS, LANGUAGE_BY_COURSE_TITLE
from courses.management.commands.enrich_course_content import build_lesson_content
from courses.models import Course, CourseModule, CourseUnit
from lessons.models import Lesson

# Every course already gets a prefix of these from seed_data.py (2-4 modules).
# Topping every course up to the full set, plus one bonus module, gives
# consistently richer content for QA/testing (Learn page, progress tracking,
# grading queue, etc.) without touching modules that already exist.
BASE_MODULE_TITLES = ['Getting Started', 'Core Concepts', 'Practical Application', 'Putting It All Together']
BONUS_MODULE_TITLE = 'Advanced Topics & Case Studies'

LESSON_TYPE_CYCLE = ['video', 'text', 'video', 'pdf', 'video', 'live_session']


class Command(BaseCommand):
    help = (
        "Tops up every course's modules to the full base set plus one bonus module, each "
        "with 4-6 fully-written lessons, so there's richer content for testing (Learn page, "
        "progress, quizzes, grading). Safe to re-run — only adds modules/titles that don't "
        "already exist on a course; never duplicates or deletes anything. Run "
        "enrich_course_content afterwards to add quizzes for the new modules."
    )

    def add_arguments(self, parser):
        parser.add_argument('--course-id', type=int, help='Only enrich this course id (for testing).')
        parser.add_argument('--limit', type=int, help='Only enrich the first N matching courses.')

    def handle(self, *args, **options):
        courses = (
            Course.objects.filter(status=Course.Status.PUBLISHED, category__isnull=False)
            .select_related('category', 'instructor')
            .order_by('id')
        )
        if options.get('course_id'):
            courses = courses.filter(id=options['course_id'])
        if options.get('limit'):
            courses = courses[: options['limit']]

        modules_added = 0
        lessons_added = 0
        skipped_categories = set()

        for course in courses:
            category_name = course.category.name
            if category_name not in CONCEPTS:
                skipped_categories.add(category_name)
                continue

            with transaction.atomic():
                m, l = self.top_up_course(course, CONCEPTS[category_name])
                modules_added += m
                lessons_added += l

        self.stdout.write(self.style.SUCCESS(
            f'Modules added: {modules_added}\nLessons added: {lessons_added}'
        ))
        if skipped_categories:
            self.stdout.write(self.style.WARNING(f'Skipped (no content bank): {sorted(skipped_categories)}'))

    def top_up_course(self, course, concepts):
        unit = CourseUnit.objects.filter(course=course).order_by('order', 'id').first()
        if not unit:
            unit = CourseUnit.objects.create(course=course, title='Lesson 1: Course Content', order=0)

        existing = list(CourseModule.objects.filter(unit=unit).order_by('order', 'id'))
        existing_titles = {m.title for m in existing}
        next_order = (max((m.order for m in existing), default=-1)) + 1

        wanted_titles = [t for t in BASE_MODULE_TITLES if t not in existing_titles]
        if BONUS_MODULE_TITLE not in existing_titles:
            wanted_titles.append(BONUS_MODULE_TITLE)

        language = LANGUAGE_BY_COURSE_TITLE.get(course.title)
        modules_added = 0
        lessons_added = 0

        for title in wanted_titles:
            module = CourseModule.objects.create(
                unit=unit, title=title, order=next_order,
                description=f'{title} for {course.title}.',
            )
            next_order += 1
            modules_added += 1

            rng = random.Random(f'top-up-module-{module.id}')
            num_lessons = rng.randint(4, 6)
            for l_index in range(num_lessons):
                lesson_type = LESSON_TYPE_CYCLE[(module.id + l_index) % len(LESSON_TYPE_CYCLE)]
                lesson = Lesson.objects.create(
                    module=module,
                    title=f'{title} - Lesson {l_index + 1}',
                    lesson_type=lesson_type,
                    duration_minutes=rng.choice([10, 15, 20, 25, 30]),
                    order=l_index,
                    status=Lesson.Status.PUBLISHED,
                )
                lesson.content = build_lesson_content(lesson, module, course, concepts, language)
                if lesson_type == 'video':
                    lesson.video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                elif lesson_type == 'live_session':
                    lesson.content_url = 'https://zoom.us/j/1234567890'
                lesson.save()
                lessons_added += 1

        return modules_added, lessons_added

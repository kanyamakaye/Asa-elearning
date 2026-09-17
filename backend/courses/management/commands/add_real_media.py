from django.core.management.base import BaseCommand
from django.db import transaction

from courses.content_bank import RESOURCES_BY_CATEGORY, VIDEOS_BY_CATEGORY
from courses.models import Course
from lessons.models import Lesson

PLACEHOLDER_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'


class Command(BaseCommand):
    help = (
        "Replaces the single reused placeholder video link with real, working YouTube videos "
        "from well-known free-education channels (curated per category in content_bank.py), "
        "and gives every 'pdf'-type lesson a real reference URL instead of none. Safe to "
        "re-run — only touches lessons that are still empty or hold the placeholder video."
    )

    def add_arguments(self, parser):
        parser.add_argument('--course-id', type=int, help='Only update this course id (for testing).')
        parser.add_argument('--limit', type=int, help='Only update the first N matching courses.')

    def handle(self, *args, **options):
        courses = (
            Course.objects.filter(category__isnull=False)
            .select_related('category')
            .order_by('id')
        )
        if options.get('course_id'):
            courses = courses.filter(id=options['course_id'])
        if options.get('limit'):
            courses = courses[: options['limit']]

        videos_updated = 0
        resources_updated = 0
        skipped_categories = set()

        for course in courses:
            category_name = course.category.name
            videos = VIDEOS_BY_CATEGORY.get(category_name)
            resource_url = RESOURCES_BY_CATEGORY.get(category_name)
            if not videos or not resource_url:
                skipped_categories.add(category_name)
                continue

            with transaction.atomic():
                v, r = self.update_course(course, videos, resource_url)
                videos_updated += v
                resources_updated += r

        self.stdout.write(self.style.SUCCESS(
            f'Video lessons updated: {videos_updated}\nPDF-lesson resource links updated: {resources_updated}'
        ))
        if skipped_categories:
            self.stdout.write(self.style.WARNING(f'Skipped (no media mapping): {sorted(skipped_categories)}'))

    def update_course(self, course, videos, resource_url):
        lessons = Lesson.objects.filter(module__unit__course=course)

        videos_updated = 0
        video_lessons = lessons.filter(lesson_type=Lesson.LessonType.VIDEO).exclude(
            video_url__in=[u for u in {f'https://www.youtube.com/watch?v={v}' for v in videos}]
        ).order_by('id')
        for lesson in video_lessons:
            if lesson.video_url and lesson.video_url != PLACEHOLDER_VIDEO_URL:
                continue
            video_id = videos[lesson.id % len(videos)]
            lesson.video_url = f'https://www.youtube.com/watch?v={video_id}'
            lesson.save(update_fields=['video_url'])
            videos_updated += 1

        resources_updated = 0
        for lesson in lessons.filter(lesson_type=Lesson.LessonType.PDF, content_url=''):
            lesson.content_url = resource_url
            lesson.save(update_fields=['content_url'])
            resources_updated += 1

        return videos_updated, resources_updated

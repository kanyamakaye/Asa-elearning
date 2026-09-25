"""Seeds 10 dummy instructors for the homepage's "Meet the instructors"
section (see components/Instructors.jsx on the frontend), which only shows
instructors with at least one published course (InstructorListView filters
on course_count__gt=0) — so each dummy instructor here also gets one
minimal published course, distinct from the full demo dataset seed_data.py
already builds.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from accounts.models import InstructorProfile
from courses.models import Course, CourseCategory

User = get_user_model()

SEED_PASSWORD = 'Demo@12345'

# Distinct from seed_data.py's own name pools, so the two commands never
# collide on email/username when run together.
DUMMY_INSTRUCTORS = [
    ('Aline', 'Uwase', 'Cloud Computing', 'AWS-certified architect teaching practical cloud deployment.', True),
    ('Eric', 'Habimana', 'Mobile Development', 'Builds and teaches native Android and iOS apps.', True),
    ('Grace', 'Mutoni', 'UX Research', 'User researcher turned educator, focused on real-world usability.', False),
    ('Jean', 'Bizimana', 'Cybersecurity', 'Security consultant teaching practical threat modeling.', True),
    ('Diane', 'Ingabire', 'Financial Analysis', 'Chartered analyst teaching applied corporate finance.', False),
    ('Patrick', 'Nshuti', 'DevOps', 'Platform engineer teaching CI/CD and infrastructure automation.', True),
    ('Claudine', 'Umutoni', 'Graphic Design', 'Brand designer teaching visual identity and layout systems.', False),
    ('Emmanuel', 'Rugamba', 'Machine Learning', 'ML engineer teaching applied model-building for beginners.', True),
    ('Sandrine', 'Uwimana', 'Project Management', 'PMP-certified instructor teaching agile delivery.', False),
    ('Robert', 'Kagabo', 'Networking', 'Network engineer teaching enterprise routing and security.', True),
]


def avatar_seed_url(username):
    return f'https://i.pravatar.cc/300?u={username}'


def thumbnail_seed_url(title):
    return f'https://picsum.photos/seed/{slugify(title)}/800/450'


class Command(BaseCommand):
    help = 'Seed 10 dummy instructors (each with one published course) for homepage/testing use.'

    def handle(self, *args, **options):
        category, _ = CourseCategory.objects.get_or_create(
            name='Professional Development',
            defaults={'description': 'Career and workplace skills.'},
        )

        created_count = 0
        for first, last, specialization, bio, has_linkedin in DUMMY_INSTRUCTORS:
            email = f'{first.lower()}.{last.lower()}@dummy.asaacademy.com'
            username = f'{first.lower()}{last.lower()}'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': first,
                    'last_name': last,
                    'user_type': User.UserType.INSTRUCTOR,
                    'email_verified': True,
                    'profile_picture_url': avatar_seed_url(username),
                },
            )
            if created:
                user.set_password(SEED_PASSWORD)
                user.save()
                created_count += 1

            InstructorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': specialization,
                    'biography': bio,
                    'years_of_experience': 5,
                    'linkedin_url': f'https://www.linkedin.com/in/{username}' if has_linkedin else '',
                },
            )

            course_title = f'{specialization} Fundamentals'
            if not Course.objects.filter(instructor=user).exists():
                Course.objects.create(
                    title=course_title,
                    short_description=f'An introduction to {specialization.lower()}.',
                    description=bio,
                    category=category,
                    instructor=user,
                    level=Course.Level.BEGINNER,
                    duration_hours=6,
                    is_free=True,
                    status=Course.Status.PUBLISHED,
                    thumbnail_url=thumbnail_seed_url(course_title),
                )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(DUMMY_INSTRUCTORS)} dummy instructors ({created_count} newly created).'
        ))

import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import InstructorProfile, StudentProfile
from assessments.models import QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion
from assignments.models import Assignment, AssignmentSubmission
from certificates.models import Certificate
from courses.models import Course, CourseCategory, CourseModule
from discussions.models import DiscussionReply, DiscussionTopic
from enrollments.models import Enrollment
from lessons.models import Lesson
from live_classes.models import Attendance, LiveSession
from messaging.models import Message
from notifications.models import Announcement, Notification
from payments.models import Payment
from reviews.models import CourseReview
from support.models import FAQ, Feedback, SupportTicket

User = get_user_model()

SEED_PASSWORD = 'Demo@12345'

CATEGORIES = [
    ('Information Technology', 'Servers, networking, and IT operations.'),
    ('Software Development', 'Programming, web, and mobile development.'),
    ('Data Science', 'Analytics, machine learning, and statistics.'),
    ('Business', 'Strategy, management, and entrepreneurship.'),
    ('Accounting', 'Bookkeeping, taxation, and financial reporting.'),
    ('Digital Marketing', 'SEO, social media, and online advertising.'),
    ('Languages', 'Conversational and professional language skills.'),
    ('Professional Development', 'Leadership, productivity, and soft skills.'),
]

INSTRUCTORS = [
    ('Grace', 'Mwangi', 'Software Development', 'Senior full-stack engineer with 8 years shipping production web apps.'),
    ('Daniel', 'Osei', 'Data Science', 'Data science lead specializing in ML pipelines and analytics platforms.'),
    ('Amara', 'Bello', 'Digital Marketing', 'Growth marketer who has run campaigns for startups and Fortune 500s alike.'),
    ('Samuel', 'Kato', 'Information Technology', 'Cloud and DevOps architect focused on scalable infrastructure.'),
    ('Wanjiru', 'Kamau', 'Information Technology', 'IT service management consultant and ITIL-certified trainer.'),
    ('Ibrahim', 'Musa', 'Software Development', 'Backend engineer turned educator, passionate about clean code.'),
    ('Kwame', 'Mensah', 'Data Science', 'Machine learning researcher with a focus on applied deep learning.'),
    ('Priya', 'Anand', 'Business', 'Management consultant helping teams build repeatable processes.'),
    ('Victor', 'Adeyemi', 'Business', 'Serial entrepreneur and startup mentor.'),
    ('Lydia', 'Chen', 'Accounting', 'Chartered accountant with a decade in corporate finance.'),
    ('Ana', 'Ferreira', 'Accounting', 'Tax advisor and bookkeeping trainer for small businesses.'),
    ('Noah', 'Bekele', 'Digital Marketing', 'Content strategist and paid-social specialist.'),
    ('Marc', 'Dubois', 'Languages', 'Language coach fluent in five languages, French native speaker.'),
    ('Sophie', 'Laurent', 'Languages', 'ESL instructor with a decade of classroom and online teaching.'),
    ('Fatima', 'Njoroge', 'Professional Development', 'Executive coach specializing in leadership development.'),
    ('Chidi', 'Okafor', 'Professional Development', 'Productivity trainer and workplace psychology enthusiast.'),
]

STUDENTS = [
    'Naledi Dube', 'Peter Achebe', 'Rita Owusu', 'Tariq Hassan', 'Chidinma Eze',
    'John Kim', 'Maria Santos', 'Ahmed Hassan', 'Wei Zhang', 'Fatou Diallo',
    'Carlos Rivera', 'Aisha Bakr', 'Liam O\'Brien', 'Yuki Tanaka', 'Sara Mensah',
]

# category_key -> list of (title, level, duration_hours, price_or_None, instructor_full_name)
COURSE_ROWS = {
    'Information Technology': [
        ('Cloud Infrastructure & DevOps Essentials', 'advanced', 26, 69, 'Samuel Kato'),
        ('Cybersecurity Fundamentals for IT Professionals', 'beginner', 10, None, 'Wanjiru Kamau'),
        ('Networking & System Administration Basics', 'beginner', 13, 39, 'Samuel Kato'),
        ('IT Service Management with ITIL', 'intermediate', 9, 45, 'Wanjiru Kamau'),
        ('Introduction to Linux Server Administration', 'intermediate', 15, 49, 'Samuel Kato'),
    ],
    'Software Development': [
        ('Full-Stack Web Development with React & Django', 'beginner', 18, 49, 'Grace Mwangi'),
        ('Mobile App Development with React Native', 'intermediate', 20, 54, 'Grace Mwangi'),
        ('Python Programming from Zero to Hero', 'beginner', 16, None, 'Ibrahim Musa'),
        ('Advanced JavaScript & Modern ES6+', 'intermediate', 12, 44, 'Ibrahim Musa'),
        ('RESTful API Design with Node.js', 'intermediate', 11, 42, 'Grace Mwangi'),
    ],
    'Data Science': [
        ('Practical Machine Learning with Python', 'intermediate', 22, 59, 'Daniel Osei'),
        ('SQL & Data Analysis for Absolute Beginners', 'beginner', 7, None, 'Daniel Osei'),
        ('Data Visualization with Power BI', 'beginner', 9, 35, 'Kwame Mensah'),
        ('Deep Learning & Neural Networks Explained', 'advanced', 24, 74, 'Kwame Mensah'),
        ('Statistics for Data Science', 'beginner', 10, 32, 'Daniel Osei'),
    ],
    'Business': [
        ('Business Strategy & Planning Essentials', 'beginner', 8, 35, 'Priya Anand'),
        ('Project Management Fundamentals', 'beginner', 10, 45, 'Priya Anand'),
        ('Entrepreneurship: From Idea to Launch', 'intermediate', 13, 49, 'Victor Adeyemi'),
        ('Business Communication Skills', 'beginner', 6, None, 'Victor Adeyemi'),
        ('Supply Chain & Operations Management', 'intermediate', 11, 52, 'Priya Anand'),
    ],
    'Accounting': [
        ('Financial Accounting for Beginners', 'beginner', 11, None, 'Lydia Chen'),
        ('Managerial Accounting Essentials', 'intermediate', 9, 39, 'Lydia Chen'),
        ('Introduction to Bookkeeping', 'beginner', 6, 25, 'Ana Ferreira'),
        ('Taxation Principles & Practice', 'intermediate', 10, 42, 'Ana Ferreira'),
        ('Financial Statement Analysis', 'advanced', 14, 56, 'Lydia Chen'),
    ],
    'Digital Marketing': [
        ('Digital Marketing Fundamentals', 'beginner', 9, None, 'Amara Bello'),
        ('Search Engine Optimization (SEO) Mastery', 'intermediate', 12, 44, 'Amara Bello'),
        ('Social Media Marketing Strategy', 'beginner', 8, 32, 'Noah Bekele'),
        ('Content Marketing & Copywriting', 'beginner', 7, 29, 'Noah Bekele'),
        ('Google Ads & PPC Advertising', 'intermediate', 10, 47, 'Amara Bello'),
    ],
    'Languages': [
        ('Conversational French for Travel & Work', 'beginner', 14, 29, 'Marc Dubois'),
        ('Business English Communication', 'intermediate', 9, 27, 'Sophie Laurent'),
        ('Spanish for Beginners', 'beginner', 12, None, 'Sophie Laurent'),
        ('Mandarin Chinese Essentials', 'beginner', 13, 34, 'Marc Dubois'),
        ('German Language Foundations', 'beginner', 11, 31, 'Sophie Laurent'),
    ],
    'Professional Development': [
        ('Leadership & Team Management Skills', 'intermediate', 8, 39, 'Fatima Njoroge'),
        ('Public Speaking & Presentation Skills', 'beginner', 6, None, 'Fatima Njoroge'),
        ('Time Management & Productivity', 'beginner', 5, 24, 'Chidi Okafor'),
        ('Emotional Intelligence at Work', 'beginner', 6, 27, 'Chidi Okafor'),
        ('Negotiation Skills for Professionals', 'intermediate', 7, 36, 'Fatima Njoroge'),
    ],
}

FAQS = [
    ('Is Asa Academy free to use?',
     'Creating an account and browsing the course catalog is completely free. Many courses are free, while others are paid and priced individually by their instructors.'),
    ('Will I receive a certificate after completing a course?',
     'Yes. Once you meet a course’s completion requirements, Asa Academy issues a certificate with a unique verification code you can share with employers.'),
    ('Can I learn at my own pace?',
     'Absolutely. Most courses are self-paced, though some include scheduled live classes you can join or catch later via recordings.'),
    ('How do I become an instructor?',
     'Sign up for an instructor account, complete your profile, and submit your first course for review. Once approved, you can publish and start teaching.'),
    ('Can I access Asa Academy on my phone?',
     'Yes, the platform is fully responsive and works in any mobile browser, so you can learn from your phone, tablet, or laptop.'),
    ('What payment methods are supported?',
     'We support major cards and mobile money for paid courses. All transactions are processed securely and refunds follow each course’s policy.'),
]

REVIEW_QUOTES = [
    'Really well structured and easy to follow. Learned a ton.',
    'The instructor explains things clearly, even the tricky parts.',
    'Exactly what I needed to level up at work.',
    'Great pacing and practical examples throughout.',
    'Would recommend to anyone starting out in this field.',
    'A bit fast in places but overall excellent content.',
]

MODULE_TITLES = ['Getting Started', 'Core Concepts', 'Practical Application', 'Putting It All Together']

LESSON_TYPE_CYCLE = ['video', 'text', 'video', 'pdf', 'video', 'live_session']

REQUIREMENTS_POOL = [
    'Basic computer literacy',
    'A reliable internet connection',
    'No prior experience required',
    'Familiarity with using a web browser',
    'A willingness to practice hands-on exercises',
    'Access to a computer (Windows, Mac, or Linux)',
]

OBJECTIVES_POOL = [
    'Explain the core concepts covered in this course',
    'Apply what you learn through hands-on exercises',
    'Build a small project to demonstrate your skills',
    'Avoid the most common beginner mistakes',
    'Confidently discuss the topic in a professional setting',
    'Prepare for more advanced study in this field',
]

TICKET_SUBJECTS = [
    ('technical', 'high', "Video won't play on lesson 3"),
    ('technical', 'urgent', 'Unable to log in after password reset'),
    ('academic', 'medium', 'Question about assignment grading criteria'),
    ('payment', 'high', 'Charged twice for the same course'),
    ('account', 'low', 'How do I change my email address?'),
    ('academic', 'medium', 'Certificate not showing after course completion'),
    ('general', 'low', 'Suggestion: dark mode for the dashboard'),
    ('technical', 'medium', 'Quiz timer resets when I refresh the page'),
    ('payment', 'urgent', 'Refund request for cancelled course'),
    ('account', 'low', 'Unable to update profile picture'),
    ('academic', 'high', 'Instructor has not responded to messages in a week'),
    ('technical', 'low', 'PDF download link is broken'),
]

NOTIFICATION_TEMPLATES = [
    ('lesson', 'New lesson available', 'A new lesson has been added to {course}.'),
    ('assignment', 'Assignment deadline approaching', 'Your assignment for {course} is due soon.'),
    ('quiz', 'Quiz available', 'A new quiz is now available in {course}.'),
    ('grade', 'New grade published', 'Your grade for {course} has been published.'),
    ('certificate', 'Certificate issued', 'Congratulations! Your certificate for {course} is ready.'),
    ('announcement', 'New announcement', 'A new announcement was posted in {course}.'),
    ('live_class', 'Live class starting soon', 'Your live class for {course} starts in 30 minutes.'),
    ('message', 'Instructor replied', 'Your instructor replied to your question in {course}.'),
]

DISCUSSION_TOPICS = [
    'Welcome — introduce yourself!',
    'Best resources to go deeper on this topic?',
    'Stuck on the module 2 exercise, any tips?',
    'Anyone else finding the pace fast?',
]
DISCUSSION_REPLIES = [
    'Great question — I had the same issue and re-reading the lesson notes helped.',
    'Thanks for sharing, this is really helpful!',
    'I found a similar example in the extra resources section.',
    "I'm working through this now too, let's compare notes.",
]

ANNOUNCEMENT_TEMPLATES = [
    ('New content added', 'We just added new lessons and resources — check them out!'),
    ('Live Q&A session scheduled', 'Join us for a live Q&A session later this week.'),
    ('Course updated', 'This course has been refreshed with updated examples and exercises.'),
]

FEEDBACK_TEMPLATES = [
    ('suggestion', 'Add downloadable slides', 'It would help to have downloadable slides for offline review.'),
    ('appreciation', 'Loving the platform', 'The dashboard is clean and easy to use — great work!'),
    ('technical', 'Slow video loading', 'Videos sometimes take a while to start buffering on my connection.'),
    ('complaint', 'Mobile layout issue', 'Some tables are hard to read on my phone screen.'),
]

MESSAGE_SUBJECTS = [
    'Question about the final project',
    'Clarification on grading rubric',
    'Thank you for the detailed feedback',
    'Extension request for assignment',
]


class Command(BaseCommand):
    help = 'Seed the database with demo categories, instructors, students, courses, and activity.'

    def handle(self, *args, **options):
        random.seed(42)

        self.stdout.write('Seeding admin account...')
        self.seed_admin()

        self.stdout.write('Seeding staff accounts (academic manager, content manager, support staff)...')
        self.seed_staff_roles()

        self.stdout.write('Seeding categories...')
        categories = self.seed_categories()

        self.stdout.write('Seeding instructors...')
        instructors = self.seed_instructors()

        self.stdout.write('Seeding students...')
        students = self.seed_students()

        self.stdout.write('Seeding courses, modules, and lessons...')
        courses = self.seed_courses(categories, instructors)

        self.stdout.write('Seeding enrollments, reviews, and certificates...')
        self.seed_activity(students, courses)

        self.stdout.write('Seeding FAQs...')
        self.seed_faqs()

        self.stdout.write('Seeding a sample quiz per category...')
        quizzes = self.seed_quizzes(courses)

        self.stdout.write('Seeding extra quiz attempts (including some pending manual grading)...')
        self.seed_quiz_attempts(students, quizzes)

        self.stdout.write('Seeding assignments and submissions...')
        self.seed_assignments(courses, students)

        self.stdout.write('Seeding payments for paid enrollments...')
        self.seed_payments(students, courses)

        self.stdout.write('Seeding support tickets...')
        self.seed_support_tickets(students, instructors)

        self.stdout.write('Seeding notifications...')
        self.seed_notifications(students)

        self.stdout.write('Seeding discussions...')
        self.seed_discussions(courses, students)

        self.stdout.write('Seeding announcements...')
        self.seed_announcements(courses)

        self.stdout.write('Seeding live classes and attendance...')
        self.seed_live_classes(courses)

        self.stdout.write('Seeding feedback and messages...')
        self.seed_feedback(students)
        self.seed_messages(students, instructors)

        self.stdout.write('Backfilling newer course/quiz/assignment/live-class fields...')
        self.backfill_new_fields(courses)

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. {len(courses)} courses, {len(instructors)} instructors, '
            f'{len(students)} students, {Enrollment.objects.count()} enrollments, '
            f'{Payment.objects.count()} payments, {SupportTicket.objects.count()} tickets, '
            f'{Notification.objects.count()} notifications.'
        ))
        self.stdout.write(self.style.SUCCESS(f'Demo password for all seeded accounts: {SEED_PASSWORD}'))

    # -- helpers ---------------------------------------------------------

    def seed_admin(self):
        if not User.objects.filter(email='admin@asaacademy.com').exists():
            User.objects.create_superuser(
                username='admin', email='admin@asaacademy.com',
                password='AdminPass123!', user_type='admin',
            )

    def seed_staff_roles(self):
        staff = [
            ('academic.manager@asaacademy.com', 'academicmanager', 'Amina', 'Yusuf', User.UserType.ACADEMIC_MANAGER),
            ('content.manager@asaacademy.com', 'contentmanager', 'Jonas', 'Weber', User.UserType.CONTENT_MANAGER),
            ('support.staff@asaacademy.com', 'supportstaff', 'Ola', 'Abiodun', User.UserType.SUPPORT_STAFF),
        ]
        for email, username, first, last, user_type in staff:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    # Deliberately not is_staff=True: that flag grants Django-admin-site
                    # access and, via IsAdmin's `is_staff or user_type == 'admin'` check,
                    # would over-grant full admin API access. These roles are scoped by
                    # user_type alone (see accounts/permissions.py's role_permission()).
                    'username': username, 'first_name': first, 'last_name': last,
                    'user_type': user_type, 'email_verified': True,
                },
            )
            if created:
                user.set_password(SEED_PASSWORD)
                user.save()

    def seed_categories(self):
        categories = {}
        for name, description in CATEGORIES:
            cat, _ = CourseCategory.objects.get_or_create(name=name, defaults={'description': description})
            categories[name] = cat
        return categories

    def seed_instructors(self):
        instructors = {}
        for first, last, specialization, bio in INSTRUCTORS:
            email = f'{first.lower()}.{last.lower()}@asaacademy.com'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f'{first.lower()}{last.lower()}',
                    'first_name': first,
                    'last_name': last,
                    'user_type': User.UserType.INSTRUCTOR,
                    'email_verified': True,
                },
            )
            if created:
                user.set_password(SEED_PASSWORD)
                user.save()
            InstructorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': specialization,
                    'biography': bio,
                    'years_of_experience': random.randint(3, 12),
                    'qualification': 'MSc' if random.random() > 0.5 else 'BSc',
                },
            )
            instructors[f'{first} {last}'] = user
        return instructors

    def seed_students(self):
        students = []
        for full_name in STUDENTS:
            first, last = full_name.split(' ', 1)
            clean_last = last.lower().replace(' ', '').replace("'", '')
            email = f'{first.lower()}.{clean_last}@student.asaacademy.com'
            username = f'{first.lower()}{clean_last}'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': first,
                    'last_name': last,
                    'user_type': User.UserType.STUDENT,
                    'email_verified': True,
                },
            )
            if created:
                user.set_password(SEED_PASSWORD)
                user.save()
            StudentProfile.objects.get_or_create(user=user)
            students.append(user)
        return students

    def seed_courses(self, categories, instructors):
        courses = []
        for category_name, rows in COURSE_ROWS.items():
            category = categories[category_name]
            for title, level, duration_hours, price, instructor_name in rows:
                instructor = instructors[instructor_name]
                course, created = Course.objects.get_or_create(
                    title=title,
                    instructor=instructor,
                    defaults={
                        'category': category,
                        'description': (
                            f'{title} is a {level}-level course covering the essential skills you need '
                            f'in {category_name.lower()}. Taught by {instructor_name}, this course combines '
                            'lessons, hands-on practice, and assessments to help you build real competence.'
                        ),
                        'short_description': f'A {level} course in {category_name.lower()}.',
                        'level': level,
                        'duration_hours': duration_hours,
                        'price': Decimal(price) if price else Decimal('0'),
                        'is_free': price is None,
                        'status': Course.Status.PUBLISHED,
                        'certificate_enabled': True,
                    },
                )
                if created:
                    self.seed_modules_and_lessons(course)
                courses.append(course)
        return courses

    def seed_modules_and_lessons(self, course):
        num_modules = random.randint(2, 4)
        for m_index, module_title in enumerate(MODULE_TITLES[:num_modules]):
            module = CourseModule.objects.create(
                course=course, title=module_title, order=m_index,
                description=f'{module_title} for {course.title}.',
            )
            for l_index in range(random.randint(3, 5)):
                # Cycle through lesson types (submodules aren't all videos in
                # practice) so the content manager UI has realistic variety.
                lesson_type = LESSON_TYPE_CYCLE[(m_index + l_index) % len(LESSON_TYPE_CYCLE)]
                lesson = Lesson.objects.create(
                    module=module,
                    title=f'{module_title} - Lesson {l_index + 1}',
                    lesson_type=lesson_type,
                    duration_minutes=random.choice([10, 15, 20, 25, 30]),
                    order=l_index,
                    is_preview=(m_index == 0 and l_index == 0),
                    status=Lesson.Status.PUBLISHED,
                    content=f'Lesson content for {module_title} - Lesson {l_index + 1}.' if lesson_type in ('text', 'pdf') else '',
                )
                if lesson_type == 'video':
                    lesson.video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    lesson.save(update_fields=['video_url'])
                elif lesson_type == 'live_session':
                    lesson.content_url = 'https://zoom.us/j/1234567890'
                    lesson.save(update_fields=['content_url'])

    def seed_activity(self, students, courses):
        for student in students:
            if Enrollment.objects.filter(student=student).exists():
                continue  # already seeded on a previous run
            # A per-student RNG keeps this deterministic regardless of how much
            # randomness earlier steps consumed (e.g. skipped on a second run).
            student_random = random.Random(student.id)
            k = student_random.randint(2, 5)
            enrolled_courses = student_random.sample(courses, k=k)
            for course in enrolled_courses:
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student, course=course,
                    defaults={'completion_percentage': Decimal(random.choice([10, 25, 40, 60, 80, 100]))},
                )
                if not created:
                    continue

                if enrollment.completion_percentage == 100:
                    enrollment.status = Enrollment.Status.COMPLETED
                    enrollment.completed_at = timezone.now() - timedelta(days=random.randint(1, 60))
                    enrollment.certificate_issued = True
                    enrollment.save()
                    Certificate.objects.get_or_create(
                        student=student, course=course, defaults={'enrollment': enrollment},
                    )

                if random.random() < 0.6:
                    CourseReview.objects.get_or_create(
                        course=course, student=student,
                        defaults={
                            'rating': random.choice([3, 4, 4, 5, 5, 5]),
                            'review_text': random.choice(REVIEW_QUOTES),
                        },
                    )

    def seed_faqs(self):
        for order, (question, answer) in enumerate(FAQS):
            FAQ.objects.get_or_create(question=question, defaults={'answer': answer, 'display_order': order})

    def seed_quizzes(self, courses):
        # One quiz per category, on that category's first course.
        quizzes = []
        seen_categories = set()
        for course in courses:
            if course.category_id in seen_categories:
                continue
            seen_categories.add(course.category_id)

            quiz, created = Quiz.objects.get_or_create(
                course=course,
                title=f'{course.title} - Knowledge Check',
                defaults={
                    'description': f'A short quiz covering the basics of {course.title}.',
                    'total_marks': 40,
                    'passing_marks': 20,
                    'attempt_limit': 3,
                    'status': Quiz.Status.PUBLISHED,
                    'created_by': course.instructor,
                },
            )
            quizzes.append(quiz)
            if not created:
                continue

            for i in range(3):
                question = QuizQuestion.objects.create(
                    quiz=quiz,
                    question_text=f'Sample question {i + 1} about {course.title}?',
                    question_type=QuizQuestion.QuestionType.MULTIPLE_CHOICE,
                    marks=10,
                    order=i,
                )
                options = ['Correct answer', 'Distractor A', 'Distractor B', 'Distractor C']
                random.shuffle(options)
                for o_index, option_text in enumerate(options):
                    QuestionOption.objects.create(
                        question=question,
                        option_text=option_text,
                        is_correct=(option_text == 'Correct answer'),
                        order=o_index,
                    )
            # One free-response question so some attempts need manual grading.
            QuizQuestion.objects.create(
                quiz=quiz,
                question_text=f'In your own words, summarize the key takeaway from {course.title}.',
                question_type=QuizQuestion.QuestionType.SHORT_ANSWER,
                marks=10,
                order=3,
            )
        return quizzes

    def seed_quiz_attempts(self, students, quizzes):
        for quiz in quizzes:
            enrolled_students = [
                e.student for e in Enrollment.objects.filter(course=quiz.course).select_related('student')
            ]
            if not enrolled_students:
                continue
            quiz_random = random.Random(quiz.id)
            attempters = quiz_random.sample(enrolled_students, k=min(len(enrolled_students), quiz_random.randint(1, 3)))

            for student in attempters:
                if QuizAttempt.objects.filter(quiz=quiz, student=student).exists():
                    continue

                mcq_questions = list(quiz.questions.exclude(question_type=QuizQuestion.QuestionType.SHORT_ANSWER))
                essay_questions = list(quiz.questions.filter(question_type=QuizQuestion.QuestionType.SHORT_ANSWER))
                leave_pending = quiz_random.random() < 0.4  # some attempts await manual grading

                attempt = QuizAttempt.objects.create(
                    quiz=quiz, student=student, attempt_number=1,
                    status=QuizAttempt.Status.SUBMITTED if leave_pending else QuizAttempt.Status.GRADED,
                    submitted_at=timezone.now() - timedelta(days=quiz_random.randint(0, 14)),
                )
                score = 0
                for question in mcq_questions:
                    got_it_right = quiz_random.random() < 0.75
                    chosen = (
                        question.options.filter(is_correct=True).first()
                        if got_it_right
                        else question.options.exclude(is_correct=True).first()
                    )
                    QuizAnswer.objects.create(
                        attempt=attempt, question=question, selected_option=chosen,
                        is_correct=got_it_right, marks_awarded=question.marks if got_it_right else 0,
                        graded_at=timezone.now(),
                    )
                    score += question.marks if got_it_right else 0
                for question in essay_questions:
                    graded = not leave_pending
                    QuizAnswer.objects.create(
                        attempt=attempt, question=question,
                        answer_text='This course helped me understand the fundamentals and apply them practically.',
                        marks_awarded=question.marks if graded else 0,
                        is_correct=graded,
                        graded_by=quiz.course.instructor if graded else None,
                        graded_at=timezone.now() if graded else None,
                    )
                    score += question.marks if graded else 0

                attempt.score = score
                attempt.percentage = round((score / quiz.total_marks) * 100, 2) if quiz.total_marks else 0
                attempt.passed = score >= quiz.passing_marks
                attempt.save()

    def seed_assignments(self, courses, students):
        seen_categories = set()
        for course in courses:
            if course.category_id in seen_categories:
                continue
            seen_categories.add(course.category_id)

            assignment, created = Assignment.objects.get_or_create(
                course=course,
                title=f'{course.title} - Practical Assignment',
                defaults={
                    'description': f'Apply what you learned in {course.title} to a short practical exercise.',
                    'maximum_marks': 100,
                    'passing_marks': 50,
                    'due_date': timezone.now() + timedelta(days=14),
                    'allow_late_submission': True,
                    'status': Assignment.Status.PUBLISHED,
                    'created_by': course.instructor,
                },
            )
            if not created:
                continue

            enrolled_students = [
                e.student for e in Enrollment.objects.filter(course=course).select_related('student')
            ]
            assignment_random = random.Random(assignment.id)
            submitters = assignment_random.sample(
                enrolled_students, k=min(len(enrolled_students), assignment_random.randint(1, 3))
            )
            for student in submitters:
                graded = assignment_random.random() < 0.5
                marks = assignment_random.choice([62, 70, 78, 85, 91]) if graded else None
                AssignmentSubmission.objects.get_or_create(
                    assignment=assignment, student=student,
                    defaults={
                        'submission_text': 'Here is my submission covering the key exercise requirements.',
                        'status': AssignmentSubmission.Status.GRADED if graded else AssignmentSubmission.Status.SUBMITTED,
                        'marks_awarded': marks,
                        'feedback': 'Solid work, well explained.' if graded else '',
                        'graded_by': course.instructor if graded else None,
                        'graded_at': timezone.now() if graded else None,
                    },
                )

    def seed_payments(self, students, courses):
        paid_courses = {c.id: c for c in courses if not c.is_free}
        for enrollment in Enrollment.objects.filter(course_id__in=paid_courses.keys()).select_related('student', 'course'):
            if Payment.objects.filter(student=enrollment.student, course=enrollment.course).exists():
                continue
            pay_random = random.Random(f'{enrollment.student_id}-{enrollment.course_id}')
            status = pay_random.choices(
                [Payment.Status.SUCCESSFUL, Payment.Status.PENDING, Payment.Status.FAILED],
                weights=[85, 10, 5],
            )[0]
            Payment.objects.create(
                student=enrollment.student,
                course=enrollment.course,
                amount=enrollment.course.price,
                currency='USD',
                payment_method=pay_random.choice(['card', 'mobile_money']),
                payment_provider=pay_random.choice(['Stripe', 'Flutterwave']),
                payment_status=status,
                payment_date=timezone.now() - timedelta(days=pay_random.randint(0, 45)) if status == Payment.Status.SUCCESSFUL else None,
            )

    def seed_support_tickets(self, students, instructors):
        all_users = students + list(instructors.values())
        for i, (category, priority, subject) in enumerate(TICKET_SUBJECTS):
            if SupportTicket.objects.filter(subject=subject).exists():
                continue
            ticket_random = random.Random(subject)
            user = ticket_random.choice(all_users)
            status = ticket_random.choices(
                [SupportTicket.Status.OPEN, SupportTicket.Status.IN_PROGRESS,
                 SupportTicket.Status.RESOLVED, SupportTicket.Status.CLOSED],
                weights=[35, 20, 30, 15],
            )[0]
            ticket = SupportTicket.objects.create(
                user=user,
                subject=subject,
                description=f'{subject}. Please look into this when you get a chance.',
                category=category,
                priority=priority,
                status=status,
            )
            # auto_now_add stamps created_at at creation time ("now"); backdate it
            # here, then place resolved_at *after* it (never before, never future).
            days_ago = ticket_random.randint(1, 20)
            created_at = timezone.now() - timedelta(days=days_ago)
            updates = {'created_at': created_at}
            if status in (SupportTicket.Status.RESOLVED, SupportTicket.Status.CLOSED):
                response_hours = ticket_random.randint(1, min(72, days_ago * 24))
                updates['resolved_at'] = created_at + timedelta(hours=response_hours)
            SupportTicket.objects.filter(pk=ticket.pk).update(**updates)

    def seed_notifications(self, students):
        for student in students:
            if Notification.objects.filter(user=student).exists():
                continue
            enrollments = list(Enrollment.objects.filter(student=student).select_related('course'))
            if not enrollments:
                continue
            note_random = random.Random(student.id)
            count = note_random.randint(3, 6)
            for _ in range(count):
                notif_type, title, message_template = note_random.choice(NOTIFICATION_TEMPLATES)
                enrollment = note_random.choice(enrollments)
                is_read = note_random.random() < 0.5
                Notification.objects.create(
                    user=student,
                    notification_type=notif_type,
                    title=title,
                    message=message_template.format(course=enrollment.course.title),
                    reference_type='course',
                    reference_id=enrollment.course_id,
                    is_read=is_read,
                    read_at=timezone.now() if is_read else None,
                )

    def seed_discussions(self, courses, students):
        for course in courses:
            enrolled_students = [
                e.student for e in Enrollment.objects.filter(course=course).select_related('student')
            ]
            if len(enrolled_students) < 2:
                continue
            if DiscussionTopic.objects.filter(course=course).exists():
                continue
            topic_random = random.Random(course.id)
            topic_title = topic_random.choice(DISCUSSION_TOPICS)
            starter = topic_random.choice(enrolled_students)
            topic = DiscussionTopic.objects.create(
                course=course, created_by=starter, title=topic_title,
                description='Starting a thread for this course — feel free to jump in!',
            )
            repliers = topic_random.sample(enrolled_students, k=min(len(enrolled_students), topic_random.randint(1, 3)))
            for replier in repliers:
                DiscussionReply.objects.create(
                    topic=topic, user=replier, reply_text=topic_random.choice(DISCUSSION_REPLIES),
                )

    def seed_announcements(self, courses):
        seen_categories = set()
        for course in courses:
            if course.category_id in seen_categories:
                continue
            seen_categories.add(course.category_id)
            title, message = random.Random(course.id).choice(ANNOUNCEMENT_TEMPLATES)
            Announcement.objects.get_or_create(
                course=course, title=title,
                defaults={
                    'message': message, 'created_by': course.instructor,
                    'audience_type': Announcement.Audience.COURSE,
                    'publish_date': timezone.now(), 'status': Announcement.Status.PUBLISHED,
                },
            )

    def seed_live_classes(self, courses):
        seen_categories = set()
        for course in courses:
            if course.category_id in seen_categories:
                continue
            seen_categories.add(course.category_id)
            if LiveSession.objects.filter(course=course).exists():
                continue

            session_random = random.Random(course.id)
            for offset_days, status in [(-7, LiveSession.Status.COMPLETED), (5, LiveSession.Status.SCHEDULED)]:
                session_date = timezone.now().date() + timedelta(days=offset_days)
                session = LiveSession.objects.create(
                    course=course, instructor=course.instructor,
                    title=f'{course.title} - Live Session',
                    description='A live walkthrough with Q&A.',
                    meeting_platform='zoom',
                    meeting_url='https://zoom.us/j/1234567890',
                    scheduled_date=session_date,
                    start_time='18:00', end_time='19:00',
                    status=status,
                )
                if status == LiveSession.Status.COMPLETED:
                    enrolled_students = [
                        e.student for e in Enrollment.objects.filter(course=course).select_related('student')
                    ]
                    for student in session_random.sample(enrolled_students, k=min(len(enrolled_students), 2)):
                        Attendance.objects.get_or_create(
                            course=course, student=student, session=session,
                            defaults={
                                'attendance_status': session_random.choice(
                                    [Attendance.Status.PRESENT, Attendance.Status.PRESENT, Attendance.Status.LATE]
                                ),
                                'check_in_time': timezone.now(),
                            },
                        )

    def seed_feedback(self, students):
        for i, (feedback_type, subject, message) in enumerate(FEEDBACK_TEMPLATES):
            if i >= len(students):
                break
            Feedback.objects.get_or_create(
                user=students[i], subject=subject,
                defaults={'feedback_type': feedback_type, 'message': message, 'rating': random.randint(3, 5)},
            )

    def seed_messages(self, students, instructors):
        instructor_list = list(instructors.values())
        for i, subject in enumerate(MESSAGE_SUBJECTS):
            if i >= len(students):
                break
            student = students[i]
            instructor = instructor_list[i % len(instructor_list)]
            if Message.objects.filter(sender=student, subject=subject).exists():
                continue
            Message.objects.create(
                sender=student, receiver=instructor, subject=subject,
                message_body=f'{subject}. Could you help clarify this when you have a moment?',
                is_read=random.random() < 0.5,
            )

    def backfill_new_fields(self, courses):
        """Fields added to Course/Quiz/Assignment/LiveSession after the main
        seed rows above were first created (course_code/thumbnail/
        discount_price/visibility/requirements/learning_objectives,
        quiz.instructions, assignment.instructions/submission_type/
        allowed_file_types/max_file_size/late_penalty, live session capacity)
        aren't set by get_or_create's `defaults` on an already-existing row —
        this fills them in idempotently so re-running the seed command keeps
        old data intact while completing it."""
        field_random = random.Random(1337)

        for course in courses:
            changed = []
            if not course.requirements:
                course.requirements = field_random.sample(REQUIREMENTS_POOL, k=2)
                changed.append('requirements')
            if not course.learning_objectives:
                course.learning_objectives = field_random.sample(OBJECTIVES_POOL, k=3)
                changed.append('learning_objectives')
            if course.discount_price is None and course.price and field_random.random() < 0.4:
                course.discount_price = (course.price * Decimal('0.8')).quantize(Decimal('0.01'))
                changed.append('discount_price')
            if not course.published_at and course.status == Course.Status.PUBLISHED:
                course.published_at = course.created_at
                changed.append('published_at')
            if changed:
                course.save(update_fields=changed)

        for quiz in Quiz.objects.all():
            if not quiz.instructions:
                quiz.instructions = (
                    f'You have {quiz.duration_minutes} minutes to complete this quiz. '
                    f'Read each question carefully — you get {quiz.attempt_limit} attempt'
                    f'{"s" if quiz.attempt_limit != 1 else ""}.'
                )
                quiz.save(update_fields=['instructions'])

        for assignment in Assignment.objects.all():
            changed = []
            if not assignment.instructions:
                assignment.instructions = (
                    'Submit your work addressing all requirements described above. '
                    'Clearly label each section of your response.'
                )
                changed.append('instructions')
            if not assignment.allowed_file_types:
                assignment.allowed_file_types = ['pdf', 'docx', 'zip']
                changed.append('allowed_file_types')
            if assignment.max_file_size is None:
                assignment.max_file_size = 10240  # KB
                changed.append('max_file_size')
            if assignment.late_penalty is None and assignment.allow_late_submission:
                assignment.late_penalty = Decimal('10.00')
                changed.append('late_penalty')
            if changed:
                assignment.save(update_fields=changed)

        for session in LiveSession.objects.filter(capacity__isnull=True):
            session.capacity = field_random.choice([25, 30, 50, 100])
            session.save(update_fields=['capacity'])

        # `seed_modules_and_lessons` only runs for newly-created courses, so
        # already-seeded courses kept every lesson at the old VIDEO-only
        # default — diversify those in place (an update, not a delete/recreate).
        for course in courses:
            for module in course.modules.all().order_by('order'):
                for lesson in module.lessons.all().order_by('order'):
                    lesson_type = LESSON_TYPE_CYCLE[(module.order + lesson.order) % len(LESSON_TYPE_CYCLE)]
                    if lesson.lesson_type == lesson_type:
                        continue
                    lesson.lesson_type = lesson_type
                    lesson.video_url = ''
                    lesson.content_url = ''
                    lesson.content = ''
                    if lesson_type == 'video':
                        lesson.video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    elif lesson_type in ('text', 'pdf'):
                        lesson.content = f'Lesson content for {lesson.title}.'
                    elif lesson_type == 'live_session':
                        lesson.content_url = 'https://zoom.us/j/1234567890'
                    lesson.save()

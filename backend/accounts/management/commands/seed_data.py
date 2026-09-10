import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import (
    InstructorProfile,
    LoginHistory,
    OTP,
    Permission,
    Role,
    RolePermission,
    StudentProfile,
    UserRole,
)
from assessments.models import Exam, Grade, QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion
from assignments.models import Assignment, AssignmentSubmission
from certificates.models import Certificate
from courses.models import Course, CourseCategory, CourseInstructor, CourseModule, CourseUnit
from discussions.models import DiscussionReply, DiscussionTopic
from enrollments.models import Enrollment
from lessons.models import LearningResource, Lesson
from live_classes.models import Attendance, LiveSession
from messaging.models import Conversation, ConversationParticipant, Message
from notifications.models import Announcement, Notification
from payments.models import Payment, Refund
from reviews.models import CourseReview, Wishlist
from support.models import FAQ, Feedback, SupportTicket

User = get_user_model()

SEED_PASSWORD = 'Demo@12345'


def thumbnail_seed_url(title):
    """A deterministic placeholder image URL for dummy course data — same
    title always resolves to the same image, so re-seeding doesn't reshuffle
    thumbnails. Populates Course.thumbnail_url, which the create-course form
    also lets instructors paste directly (it takes priority over an
    uploaded file/image when set)."""
    return f'https://picsum.photos/seed/{slugify(title)}/800/450'


def avatar_seed_url(username):
    """A deterministic placeholder headshot for dummy user data — same
    username always resolves to the same face. Populates
    User.profile_picture_url, which the Profile page also lets any user
    paste directly (it takes priority over an uploaded file when set)."""
    return f'https://i.pravatar.cc/300?u={username}'

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

# Additional instructors beyond the 16 curated above (which own the courses in
# COURSE_ROWS by name) — used for co-instructor assignments, extra courses,
# and to pad general user/activity counts toward realistic dev-seed volumes.
EXTRA_INSTRUCTOR_FIRST_NAMES = [
    'Elena', 'Farid', 'Hassan', 'Imani', 'Jonas', 'Kavya', 'Liu', 'Mateus', 'Nia', 'Omar',
    'Paula', 'Quang', 'Rita', 'Sanjay', 'Tanvi', 'Ugo', 'Vera', 'Walid', 'Xena', 'Yara',
    'Zane', 'Bianca', 'Carlos', 'Deepa', 'Elias', 'Fumiko', 'Gideon', 'Hana', 'Ines', 'Jamal',
    'Keiko', 'Leon', 'Mira', 'Noor',
    # second wave — doubles the extra-instructor pool
    'Adaeze', 'Boris', 'Chiara', 'Dawit', 'Esi', 'Faisal', 'Greta', 'Hiro', 'Ifeoma', 'Jaroslav',
    'Kemal', 'Lucia', 'Mohsin', 'Naomi', 'Oleg', 'Petra', 'Qadir', 'Ronke', 'Stella', 'Tomas',
    'Uche', 'Valeria', 'Wole', 'Ximena', 'Yosef', 'Zara', 'Abel', 'Bilal', 'Chinwe', 'Dmitri',
    'Ekaterina', 'Femi', 'Giulia', 'Habib', 'Ingrid', 'Junior', 'Khalid', 'Lerato', 'Mohammed', 'Nasrin',
    'Ola', 'Pilar', 'Quinn', 'Ravi', 'Selim', 'Temitope', 'Ulla', 'Vikram', 'Winnie', 'Zaid',
]
EXTRA_INSTRUCTOR_LAST_NAMES = [
    'Abara', 'Bakr', 'Chen', 'Dlamini', 'Eze', 'Faruk', 'Garcia', 'Haile', 'Ivanov', 'Jansen',
    'Kariuki', 'Lund', 'Mensah', 'Nakamura', 'Okonkwo', 'Patel', 'Quinones', 'Rossi', 'Suarez', 'Tesfaye',
    'Umeh', 'Vance', 'Wanjala', 'Xu', 'Yamada', 'Zulu', 'Abioye', 'Baptiste', 'Costa', 'Diallo',
    'Ekwueme', 'Farooq', 'Gomez', 'Haruna',
    # second wave — doubles the extra-instructor pool
    'Adeyinka', 'Botha', 'Castro', 'Demir', 'Eshun', 'Fontaine', 'Gebre', 'Hadid', 'Ilori', 'Jovanovic',
    'Kagawa', 'Lindqvist', 'Moyo', 'Nwachukwu', 'Ochieng', 'Petrov', 'Qureshi', 'Rahimi', 'Silva', 'Tanaka',
    'Uwimana', 'Vargas', 'Wong', 'Yilmaz', 'Zaman', 'Anwar', 'Bello', 'Chowdhury', 'Duarte', 'Essien',
    'Fischer', 'Gyasi', 'Hassan', 'Idowu', 'Jallow', 'Kimathi', 'Lombard', 'Mwakalinga', 'Njoku', 'Okoro',
    'Pereira', 'Qasim', 'Reyes', 'Siddiqui', 'Tadesse', 'Ude', 'Villanueva', 'Wachira', 'Yeboah', 'Zubair',
]

# Extra students beyond the 15 curated above — same rationale as instructors,
# gives enough volume for enrollments/reviews/payments/notifications to
# comfortably clear ~50 rows once every student enrolls in a few courses.
EXTRA_STUDENT_NAMES = [
    'Grace Nyambura', 'Daniel Otieno', 'Amina Yusuf', 'Samuel Adebayo', 'Wanjiku Njoroge',
    'Ibrahim Suleiman', 'Kwame Asante', 'Priya Sharma', 'Victor Nwosu', 'Lydia Wambui',
    'Ana Beatriz', 'Noah Abara', 'Marc Petit', 'Sophie Martin', 'Fatima Al-Sayed',
    'Chidi Nnamdi', 'Rachel Kimani', 'David Mwangi', 'Miriam Cohen', 'Youssef Khalil',
    'Ling Wei', 'Isabella Rossi', 'Kofi Boateng', 'Halima Bello', 'Erik Johansson',
    'Nadia Rahman', 'Thabo Nkosi', 'Camila Torres', 'Femi Adeyemi', 'Anika Chowdhury',
    'Gabriel Santos', 'Zanele Dube', 'Hiroshi Sato', 'Layla Haddad', 'Michael Osei',
    'Valentina Cruz', 'Idris Bello', 'Aiko Yamamoto', 'Ronald Kiptoo', 'Selam Tesfaye',
    'Bongani Zulu', 'Esperanza Diaz', 'Tunde Bakare', 'Meera Nair', 'Oscar Mensah',
    # second wave — doubles the extra-student pool
    'Adanna Okeke', 'Boris Ivanov', 'Chiara Bianchi', 'Dawit Alemu', 'Esi Owusu',
    'Faisal Rahman', 'Greta Nilsson', 'Hiro Nakata', 'Ifeoma Chukwu', 'Jaroslav Novak',
    'Kemal Yildiz', 'Lucia Fernandez', 'Mohsin Raza', 'Naomi Wanjiru', 'Oleg Petrenko',
    'Petra Horvat', 'Qadir Malik', 'Ronke Adigun', 'Stella Achieng', 'Tomas Novotny',
    'Uche Okafor', 'Valeria Moreno', 'Wole Fashola', 'Ximena Rojas', 'Yosef Girma',
    'Zara Ahmadi', 'Abel Tesfaye', 'Bilal Ansari', 'Chinwe Obi', 'Dmitri Volkov',
    'Ekaterina Popova', 'Femi Alabi', 'Giulia Ferrari', 'Habib Rahimi', 'Ingrid Larsen',
    'Junior Baptiste', 'Khalid Nasser', 'Lerato Mokoena', 'Mohammed Farah', 'Nasrin Karimi',
    'Ola Adekunle', 'Pilar Sanchez', 'Quinn Fitzgerald', 'Ravi Kapoor', 'Selim Aydin',
    'Temitope Balogun', 'Ulla Berg', 'Vikram Malhotra', 'Winnie Achola', 'Zaid Hamdan',
    'Aliyah Bashir', 'Benedict Osei', 'Carmen Lopez', 'Diego Fuentes', 'Ebele Nwankwo',
    'Frida Karlsson', 'Godwin Etim', 'Halina Kowalski', 'Ismail Hodzic', 'Jia Li',
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

# 8 extra courses per category, assigned to the extra_by_category instructor
# pool (see seed_instructors) rather than the curated named instructors above.
EXTRA_COURSE_TOPICS = {
    'Information Technology': [
        ('Windows Server Administration Essentials', 'intermediate', 12, 41), ('Virtualization with VMware & Hyper-V', 'advanced', 14, 52),
        ('Network Security Fundamentals', 'intermediate', 11, 45), ('Introduction to Containers & Docker', 'beginner', 9, 36),
        ('IT Help Desk & Technical Support', 'beginner', 8, None), ('Cloud Computing with AWS Basics', 'intermediate', 13, 48),
        ('Database Administration Essentials', 'intermediate', 10, 42), ('Kubernetes for Beginners', 'advanced', 15, 58),
        ('Microsoft Azure Fundamentals', 'beginner', 11, 40), ('IT Project Management Basics', 'intermediate', 9, 37),
        ('PowerShell Scripting for Admins', 'intermediate', 8, 35), ('Cybersecurity Incident Response', 'advanced', 13, 55),
    ],
    'Software Development': [
        ('Testing & Test-Driven Development with Python', 'intermediate', 10, 38), ('GraphQL API Development', 'intermediate', 9, 40),
        ('Introduction to Go Programming', 'beginner', 11, 39), ('Building Microservices with Docker', 'advanced', 16, 56),
        ('Vue.js for Frontend Development', 'intermediate', 10, 37), ('Java Programming Essentials', 'beginner', 14, None),
        ('DevOps Practices for Developers', 'intermediate', 12, 46), ('Mobile App Development with Flutter', 'intermediate', 15, 50),
        ('TypeScript for JavaScript Developers', 'intermediate', 8, 34), ('Introduction to Rust Programming', 'advanced', 13, 47),
        ('C# and .NET Fundamentals', 'beginner', 14, None), ('Building CLIs and Developer Tools', 'intermediate', 7, 31),
    ],
    'Data Science': [
        ('Data Engineering Fundamentals', 'intermediate', 15, 55), ('A/B Testing for Product Teams', 'beginner', 6, None),
        ('Natural Language Processing Basics', 'advanced', 18, 62), ('Data Cleaning & Preprocessing', 'beginner', 7, 29),
        ('Time Series Analysis & Forecasting', 'advanced', 16, 59), ('Big Data with Apache Spark', 'advanced', 17, 61),
        ('Python for Data Analysis', 'beginner', 9, 33), ('Business Intelligence Fundamentals', 'beginner', 8, None),
        ('Data Storytelling & Visualization', 'intermediate', 8, 34), ('Introduction to R Programming', 'beginner', 10, 32),
        ('MLOps Fundamentals', 'advanced', 14, 57), ('Computer Vision Basics', 'advanced', 16, 60),
    ],
    'Business': [
        ('Financial Modeling for Startups', 'intermediate', 9, 44), ('Change Management Essentials', 'beginner', 7, 33),
        ('Business Analytics Fundamentals', 'intermediate', 10, 41), ('Risk Management Basics', 'beginner', 6, 28),
        ('Corporate Governance Essentials', 'intermediate', 8, 39), ('Introduction to Business Law', 'beginner', 7, None),
        ('Lean Six Sigma Fundamentals', 'advanced', 12, 53), ('Customer Relationship Management', 'beginner', 6, 27),
        ('Strategic Marketing Planning', 'intermediate', 9, 40), ('Business Negotiation Tactics', 'intermediate', 7, 32),
        ('Startup Fundraising Essentials', 'advanced', 10, 46), ('Operations & Process Improvement', 'intermediate', 8, 36),
    ],
    'Accounting': [
        ('Payroll Management Basics', 'beginner', 6, 26), ('Cost Accounting Fundamentals', 'intermediate', 8, 37),
        ('Auditing Principles & Practice', 'advanced', 11, 48), ('Introduction to QuickBooks', 'beginner', 5, None),
        ('Forensic Accounting Basics', 'advanced', 10, 46), ('Budgeting & Forecasting Essentials', 'intermediate', 7, 34),
        ('International Financial Reporting Standards', 'advanced', 13, 51), ('Small Business Accounting', 'beginner', 6, None),
        ('Corporate Tax Planning', 'advanced', 11, 47), ('Excel for Accountants', 'beginner', 6, 25),
        ('Nonprofit Accounting Essentials', 'intermediate', 7, 33), ('Accounts Payable & Receivable Management', 'beginner', 5, None),
    ],
    'Digital Marketing': [
        ('Email Marketing Automation', 'beginner', 6, 28), ('Influencer Marketing Strategy', 'intermediate', 7, 31),
        ('Marketing Analytics Fundamentals', 'intermediate', 9, 36), ('Affiliate Marketing Basics', 'beginner', 5, None),
        ('Brand Strategy & Positioning', 'intermediate', 8, 34), ('TikTok & Short-Form Video Marketing', 'beginner', 6, 25),
        ('Conversion Rate Optimization', 'advanced', 10, 42), ('E-commerce Marketing Essentials', 'beginner', 7, None),
        ('LinkedIn Marketing for Business', 'beginner', 6, 27), ('Marketing Automation Tools', 'intermediate', 8, 35),
        ('Video Marketing & YouTube Growth', 'intermediate', 9, 38), ('Growth Hacking Fundamentals', 'advanced', 10, 43),
    ],
    'Languages': [
        ('Portuguese for Beginners', 'beginner', 12, 28), ('Italian Conversation Basics', 'beginner', 10, None),
        ('Japanese for Absolute Beginners', 'beginner', 14, 32), ('Korean Language Foundations', 'beginner', 13, 30),
        ('Arabic for Travel & Business', 'beginner', 11, None), ('Advanced French Grammar', 'advanced', 10, 33),
        ('Dutch Language Essentials', 'beginner', 9, 26), ('Swahili for Beginners', 'beginner', 8, None),
        ('Russian Language Basics', 'beginner', 12, 29), ('Business Spanish for Professionals', 'intermediate', 9, 31),
        ('Hindi for Beginners', 'beginner', 11, None), ('Turkish Language Foundations', 'beginner', 10, 27),
    ],
    'Professional Development': [
        ('Conflict Resolution at Work', 'beginner', 5, 23), ('Effective Delegation Skills', 'beginner', 5, None),
        ('Critical Thinking & Problem Solving', 'beginner', 6, 25), ('Workplace Communication Skills', 'beginner', 5, None),
        ('Building Resilience & Stress Management', 'beginner', 6, 24), ('Coaching & Mentoring Fundamentals', 'intermediate', 7, 30),
        ('Personal Branding for Professionals', 'beginner', 5, None), ('Effective Meetings & Facilitation', 'beginner', 4, 20),
        ('Career Development Planning', 'beginner', 5, 22), ('Emotional Resilience & Mindfulness', 'beginner', 6, 26),
        ('Cross-Cultural Communication', 'intermediate', 7, 29), ('Remote Team Leadership', 'intermediate', 8, 32),
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

# Category-specific FAQ patterns — combined with CATEGORIES to generate a
# larger, still-plausible FAQ set without hand-writing 50 bespoke entries.
FAQ_PATTERNS = [
    ('Do I need prior experience for {cat} courses?',
     'Most {cat_lower} courses are beginner-friendly and list any prerequisites in the course description, so check there before enrolling.'),
    ('How long does it take to complete a {cat} course?',
     'Course length varies, but most {cat_lower} courses on Asa Academy range from a few hours to under 30 hours of content, and you can always learn at your own pace.'),
    ('Will I get a certificate for {cat} courses?',
     'Yes, {cat_lower} courses with certification enabled award a verifiable certificate once you complete all required lessons and assessments.'),
    ('Are there live classes for {cat} courses?',
     'Some {cat_lower} courses include scheduled live sessions with the instructor — check the course page for the upcoming schedule.'),
    ('How much do {cat} courses cost?',
     '{cat} courses range from free introductory courses to paid, in-depth programs — pricing is shown on each course page.'),
    ('Can I ask the instructor questions in a {cat} course?',
     'Yes, every {cat_lower} course has a discussion area where you can post questions and get help from the instructor and other learners.'),
    ('Are {cat} courses updated regularly?',
     'Instructors periodically refresh {cat_lower} courses with new examples and resources, and any major update is noted on the course page.'),
    ('Can I get a refund for a {cat} course?',
     'Yes, {cat_lower} courses follow the platform-wide refund policy — reach out to support within the eligible window from the payments page.'),
    ('Is there a mobile-friendly version of {cat} courses?',
     'Yes, all {cat_lower} course content is fully responsive and works well on phones, tablets, and laptops alike.'),
    ('Do {cat} courses include downloadable resources?',
     'Many {cat_lower} courses include downloadable slides, worksheets, or code samples alongside the video and text lessons.'),
    ('Can I retake a {cat} course quiz if I fail?',
     'Yes, most {cat_lower} course quizzes allow multiple attempts — check the specific quiz settings for its attempt limit.'),
    ('How do I track my progress in a {cat} course?',
     'Your dashboard shows a progress bar for every {cat_lower} course you are enrolled in, updated automatically as you complete lessons.'),
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
    ('technical', 'medium', 'Course thumbnail not displaying correctly'),
    ('technical', 'high', 'App crashes when submitting a quiz'),
    ('academic', 'low', 'How is the final grade calculated?'),
    ('academic', 'medium', 'Requesting an assignment deadline extension'),
    ('academic', 'high', 'Live class recording is missing'),
    ('payment', 'medium', 'Discount code not applying at checkout'),
    ('payment', 'low', 'Invoice needed for a completed purchase'),
    ('payment', 'high', 'Payment failed but amount was deducted'),
    ('account', 'medium', 'Two-factor login keeps failing'),
    ('account', 'low', 'How do I delete my account?'),
    ('account', 'medium', 'Wrong name shown on my certificate'),
    ('general', 'low', 'Feature request: bookmark favorite lessons'),
    ('general', 'medium', 'Feedback on the new dashboard layout'),
    ('general', 'low', 'How do I contact an instructor directly?'),
    ('technical', 'urgent', 'Site is completely unresponsive on mobile'),
    ('technical', 'medium', 'Search results are not showing recent courses'),
    ('technical', 'low', 'Typo found in a lesson transcript'),
    ('academic', 'urgent', 'Suspected error in exam grading'),
    ('academic', 'medium', 'Cannot access a lesson marked as preview'),
    ('payment', 'urgent', 'Subscription renewed without consent'),
    ('payment', 'medium', 'Currency shown is incorrect for my region'),
    ('account', 'high', 'Account locked after multiple login attempts'),
    ('account', 'low', 'Notification emails are not arriving'),
    ('general', 'medium', 'Suggestion: add a course completion checklist'),
    ('technical', 'high', 'Downloaded certificate PDF is corrupted'),
    ('technical', 'medium', 'Progress bar not updating after finishing a lesson'),
    ('academic', 'low', 'Where can I see my quiz attempt history?'),
    ('academic', 'medium', 'Group project submission is unclear'),
    ('payment', 'low', 'Question about refund processing time'),
    ('account', 'medium', 'Unable to switch from student to instructor account'),
    ('general', 'low', 'Request for a mobile app'),
    ('technical', 'medium', 'Live class audio keeps cutting out'),
    ('technical', 'low', 'Course filter by price is not working'),
    ('academic', 'high', 'Plagiarism flag on my assignment seems incorrect'),
    ('payment', 'medium', 'Need to update my saved card details'),
    ('account', 'low', 'How do I merge two accounts?'),
    ('general', 'medium', 'Dark mode causes text contrast issues'),
    ('technical', 'urgent', 'Cannot upload assignment file — upload stuck at 0%'),
    ('academic', 'medium', 'Missing lesson in module 3'),
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
    ('suggestion', 'Add a dark mode toggle', 'A dark mode option would be great for late-night studying.'),
    ('appreciation', 'Great instructor support', 'My instructor responded quickly and the explanation really helped.'),
    ('technical', 'Quiz page loads slowly', 'The quiz page takes a few seconds longer than the rest of the site.'),
    ('complaint', 'Too many notification emails', 'I would like more control over how many emails I receive.'),
    ('suggestion', 'Offline course downloads', 'Being able to download lessons for offline viewing would help a lot.'),
    ('appreciation', 'Certificates look professional', 'The certificate design is clean and I was proud to share it.'),
]

MESSAGE_SUBJECTS = [
    'Question about the final project',
    'Clarification on grading rubric',
    'Thank you for the detailed feedback',
    'Extension request for assignment',
    'Question about upcoming live class',
    'Trouble accessing course materials',
    'Follow-up on quiz results',
    'Request for additional resources',
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
        instructors, extra_by_category, all_instructors = self.seed_instructors()

        self.stdout.write('Seeding students...')
        students = self.seed_students()

        self.stdout.write('Seeding courses, modules, and lessons...')
        courses = self.seed_courses(categories, instructors)
        courses += self.seed_extra_courses(categories, extra_by_category)

        self.stdout.write('Seeding co-instructor assignments...')
        self.seed_course_instructors(courses, all_instructors)

        self.stdout.write('Seeding enrollments, reviews, and certificates...')
        self.seed_activity(students, courses)
        self.ensure_minimum_certificates(students, courses)

        self.stdout.write('Seeding FAQs...')
        self.seed_faqs(categories)

        self.stdout.write('Seeding quizzes (one per course)...')
        quizzes = self.seed_quizzes(courses)

        self.stdout.write('Seeding extra quiz attempts (including some pending manual grading)...')
        self.seed_quiz_attempts(students, quizzes)

        self.stdout.write('Seeding assignments and submissions...')
        assignments = self.seed_assignments(courses, students)

        self.stdout.write('Seeding exams and grades...')
        exams = self.seed_exams(courses)
        self.seed_grades(quizzes, assignments, exams)

        self.stdout.write('Seeding payments and refunds...')
        self.seed_payments(students, courses)
        self.seed_refunds()

        self.stdout.write('Seeding wishlists...')
        self.seed_wishlists(students, courses)

        self.stdout.write('Seeding learning resources...')
        self.seed_learning_resources(courses)

        self.stdout.write('Seeding support tickets...')
        self.seed_support_tickets(students, all_instructors)

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
        self.seed_messages(students, all_instructors)

        all_users = list(User.objects.all())

        self.stdout.write('Seeding login history...')
        self.seed_login_history(all_users)

        self.stdout.write('Seeding password reset / email verification tokens...')
        self.seed_tokens(all_users)

        self.stdout.write('Seeding roles and permissions...')
        self.seed_role_permissions(all_users)

        self.stdout.write('Backfilling newer course/quiz/assignment/live-class fields...')
        self.backfill_new_fields(courses)

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. {len(courses)} courses, {len(all_instructors)} instructors, '
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

    def _create_instructor(self, first, last, specialization, bio):
        email = f'{first.lower()}.{last.lower()}@asaacademy.com'
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
        InstructorProfile.objects.get_or_create(
            user=user,
            defaults={
                'specialization': specialization,
                'biography': bio,
                'years_of_experience': random.randint(3, 12),
                'qualification': 'MSc' if random.random() > 0.5 else 'BSc',
            },
        )
        return user

    def seed_instructors(self):
        """Returns (instructors, extra_by_category, all_instructors):
        - instructors: name -> User, for the 16 curated instructors that own
          COURSE_ROWS by name.
        - extra_by_category: category name -> list of additional instructor
          Users (not tied to a curated course), used for extra courses and
          co-instructor assignments.
        - all_instructors: every instructor User, curated + extra.
        """
        instructors = {}
        for first, last, specialization, bio in INSTRUCTORS:
            instructors[f'{first} {last}'] = self._create_instructor(first, last, specialization, bio)

        extra_by_category = {name: [] for name, _ in CATEGORIES}
        for i, (first, last) in enumerate(zip(EXTRA_INSTRUCTOR_FIRST_NAMES, EXTRA_INSTRUCTOR_LAST_NAMES)):
            category_name = CATEGORIES[i % len(CATEGORIES)][0]
            bio = f'{category_name}-focused instructor with hands-on industry experience.'
            user = self._create_instructor(first, last, category_name, bio)
            extra_by_category[category_name].append(user)

        all_instructors = list(instructors.values()) + [u for users in extra_by_category.values() for u in users]
        return instructors, extra_by_category, all_instructors

    def _create_student(self, full_name):
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
                'profile_picture_url': avatar_seed_url(username),
            },
        )
        if created:
            user.set_password(SEED_PASSWORD)
            user.save()
        StudentProfile.objects.get_or_create(user=user)
        return user

    def seed_students(self):
        return [self._create_student(full_name) for full_name in STUDENTS + EXTRA_STUDENT_NAMES]

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
                        'thumbnail_url': thumbnail_seed_url(title),
                    },
                )
                if created:
                    self.seed_modules_and_lessons(course)
                courses.append(course)
        return courses

    def seed_modules_and_lessons(self, course):
        unit = CourseUnit.objects.create(course=course, title='Lesson 1: Course Content', order=0)
        num_modules = random.randint(2, 4)
        for m_index, module_title in enumerate(MODULE_TITLES[:num_modules]):
            module = CourseModule.objects.create(
                unit=unit, title=module_title, order=m_index,
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

    def seed_extra_courses(self, categories, extra_by_category):
        """2 additional courses per category (see EXTRA_COURSE_TOPICS),
        assigned to the extra_by_category instructor pool rather than the
        curated named instructors in COURSE_ROWS."""
        courses = []
        for category_name, rows in EXTRA_COURSE_TOPICS.items():
            category = categories[category_name]
            pool = extra_by_category[category_name]
            for i, (title, level, duration_hours, price) in enumerate(rows):
                instructor = pool[i % len(pool)]
                course, created = Course.objects.get_or_create(
                    title=title,
                    instructor=instructor,
                    defaults={
                        'category': category,
                        'description': (
                            f'{title} is a {level}-level course covering the essential skills you need '
                            f'in {category_name.lower()}. This course combines lessons, hands-on practice, '
                            'and assessments to help you build real competence.'
                        ),
                        'short_description': f'A {level} course in {category_name.lower()}.',
                        'level': level,
                        'duration_hours': duration_hours,
                        'price': Decimal(price) if price else Decimal('0'),
                        'is_free': price is None,
                        'status': Course.Status.PUBLISHED,
                        'certificate_enabled': True,
                        'thumbnail_url': thumbnail_seed_url(title),
                    },
                )
                if created:
                    self.seed_modules_and_lessons(course)
                courses.append(course)
        return courses

    def seed_course_instructors(self, courses, all_instructors):
        """Assigns a co-instructor to most courses (skips a course's own
        primary instructor)."""
        for course in courses:
            co_random = random.Random(f'co-{course.id}')
            candidates = [i for i in all_instructors if i.id != course.instructor_id]
            if not candidates:
                continue
            co_instructor = co_random.choice(candidates)
            CourseInstructor.objects.get_or_create(
                course=course, instructor=co_instructor,
                defaults={'instructor_role': co_random.choice(
                    [CourseInstructor.Role.ASSISTANT, CourseInstructor.Role.TUTOR, CourseInstructor.Role.MODERATOR]
                )},
            )

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
                    defaults={'completion_percentage': Decimal(random.choice([10, 25, 40, 60, 80, 100, 100]))},
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

    def ensure_minimum_certificates(self, students, courses, target=100):
        """Certificate count depends on the random 100%-completion draw above
        — top it up deterministically so dev seeds always have plenty to
        page through, regardless of how the randomness falls."""
        existing = Certificate.objects.count()
        if existing >= target:
            return
        candidates = list(
            Enrollment.objects.exclude(certificates__isnull=False)
            .select_related('student', 'course').order_by('id')
        )
        cert_random = random.Random('certificates')
        cert_random.shuffle(candidates)
        for enrollment in candidates:
            if Certificate.objects.count() >= target:
                break
            enrollment.completion_percentage = Decimal('100')
            enrollment.status = Enrollment.Status.COMPLETED
            enrollment.completed_at = enrollment.completed_at or timezone.now() - timedelta(days=cert_random.randint(1, 60))
            enrollment.certificate_issued = True
            enrollment.save()
            Certificate.objects.get_or_create(
                student=enrollment.student, course=enrollment.course, defaults={'enrollment': enrollment},
            )

    def seed_faqs(self, categories):
        for order, (question, answer) in enumerate(FAQS):
            FAQ.objects.get_or_create(question=question, defaults={'answer': answer, 'display_order': order})

        order = len(FAQS)
        for category_name in categories:
            for question_tpl, answer_tpl in FAQ_PATTERNS:
                fmt = {'cat': category_name, 'cat_lower': category_name.lower()}
                FAQ.objects.get_or_create(
                    question=question_tpl.format(**fmt),
                    defaults={'answer': answer_tpl.format(**fmt), 'category': category_name, 'display_order': order},
                )
                order += 1

    def seed_quizzes(self, courses):
        # One quiz per course.
        quizzes = []
        for course in courses:
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
        # One assignment per course.
        assignments = []
        for course in courses:
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
            assignments.append(assignment)
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
        return assignments

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

    def seed_refunds(self):
        reasons = [
            'Course was not as described.',
            'Accidentally purchased a duplicate course.',
            'Technical issues prevented access to the content.',
            'Changed my mind shortly after purchase.',
            'Requested a switch to a different course instead.',
        ]
        successful_payments = list(Payment.objects.filter(payment_status=Payment.Status.SUCCESSFUL).select_related('student'))
        refund_random = random.Random('refunds')
        refund_random.shuffle(successful_payments)
        # Enough of the successful payments to comfortably clear ~50 refunds.
        for payment in successful_payments[:120]:
            if Refund.objects.filter(payment=payment).exists():
                continue
            status = refund_random.choices(
                [Refund.Status.PENDING, Refund.Status.APPROVED, Refund.Status.REJECTED, Refund.Status.COMPLETED],
                weights=[30, 20, 20, 30],
            )[0]
            requested_at = timezone.now() - timedelta(days=refund_random.randint(1, 30))
            refund = Refund.objects.create(
                payment=payment,
                student=payment.student,
                refund_amount=payment.amount,
                refund_reason=refund_random.choice(reasons),
                refund_status=status,
                processed_by=payment.course.instructor if status != Refund.Status.PENDING else None,
                processed_at=requested_at + timedelta(days=refund_random.randint(1, 5)) if status != Refund.Status.PENDING else None,
            )
            Refund.objects.filter(pk=refund.pk).update(requested_at=requested_at)

    def seed_wishlists(self, students, courses):
        for student in students:
            wish_random = random.Random(f'wishlist-{student.id}')
            enrolled_ids = set(Enrollment.objects.filter(student=student).values_list('course_id', flat=True))
            candidates = [c for c in courses if c.id not in enrolled_ids]
            if not candidates:
                continue
            picks = wish_random.sample(candidates, k=min(len(candidates), wish_random.randint(1, 2)))
            for course in picks:
                Wishlist.objects.get_or_create(student=student, course=course)

    def seed_learning_resources(self, courses):
        resource_random = random.Random('resources')
        resource_types = [LearningResource.ResourceType.PRESENTATION, LearningResource.ResourceType.PDF, LearningResource.ResourceType.DOCUMENT]
        for course in courses:
            lessons = list(Lesson.objects.filter(module__unit__course=course).order_by('order')[:2])
            for lesson in lessons:
                if LearningResource.objects.filter(lesson=lesson).exists():
                    continue
                resource_type = resource_random.choice(resource_types)
                LearningResource.objects.create(
                    course=course, lesson=lesson,
                    title=f'{lesson.title} - Supplementary Material',
                    resource_type=resource_type,
                    file_url='https://example.com/resources/sample.pdf',
                    file_name='sample.pdf',
                    is_downloadable=True,
                    uploaded_by=course.instructor,
                )

    def seed_exams(self, courses):
        exams = []
        exam_random = random.Random('exams')
        for course in courses:
            exam, created = Exam.objects.get_or_create(
                course=course,
                title=f'{course.title} - Final Exam',
                defaults={
                    'description': f'Comprehensive final exam covering all modules of {course.title}.',
                    'exam_date': (timezone.now() + timedelta(days=exam_random.randint(-30, 30))).date(),
                    'start_time': '09:00',
                    'end_time': '11:00',
                    'duration_minutes': 120,
                    'total_marks': 100,
                    'passing_marks': 50,
                    'attempt_limit': 1,
                    'status': exam_random.choice([Exam.Status.SCHEDULED, Exam.Status.COMPLETED]),
                    'created_by': course.instructor,
                },
            )
            exams.append(exam)
        return exams

    def seed_grades(self, quizzes, assignments, exams):
        grade_random = random.Random('grades')

        for quiz in quizzes:
            for attempt in QuizAttempt.objects.filter(quiz=quiz, status=QuizAttempt.Status.GRADED).select_related('student'):
                if Grade.objects.filter(student=attempt.student, course=quiz.course, assessment_type=Grade.AssessmentType.QUIZ, assessment_id=quiz.id).exists():
                    continue
                Grade.objects.create(
                    student=attempt.student, course=quiz.course,
                    assessment_type=Grade.AssessmentType.QUIZ, assessment_id=quiz.id,
                    marks_obtained=attempt.score, maximum_marks=quiz.total_marks,
                    remarks='Auto-generated from quiz attempt.', graded_by=quiz.course.instructor,
                )

        for assignment in assignments:
            for submission in AssignmentSubmission.objects.filter(
                assignment=assignment, status=AssignmentSubmission.Status.GRADED, marks_awarded__isnull=False,
            ).select_related('student'):
                if Grade.objects.filter(student=submission.student, course=assignment.course, assessment_type=Grade.AssessmentType.ASSIGNMENT, assessment_id=assignment.id).exists():
                    continue
                Grade.objects.create(
                    student=submission.student, course=assignment.course,
                    assessment_type=Grade.AssessmentType.ASSIGNMENT, assessment_id=assignment.id,
                    marks_obtained=submission.marks_awarded, maximum_marks=assignment.maximum_marks,
                    remarks='Auto-generated from assignment submission.', graded_by=assignment.course.instructor,
                )

        for exam in exams:
            if exam.status != Exam.Status.COMPLETED:
                continue
            enrolled_students = [e.student for e in Enrollment.objects.filter(course=exam.course).select_related('student')]
            for student in grade_random.sample(enrolled_students, k=min(len(enrolled_students), grade_random.randint(1, 3))):
                if Grade.objects.filter(student=student, course=exam.course, assessment_type=Grade.AssessmentType.EXAM, assessment_id=exam.id).exists():
                    continue
                marks = grade_random.choice([55, 62, 70, 78, 85, 91])
                Grade.objects.create(
                    student=student, course=exam.course,
                    assessment_type=Grade.AssessmentType.EXAM, assessment_id=exam.id,
                    marks_obtained=marks, maximum_marks=exam.total_marks,
                    remarks='Final exam result.', graded_by=exam.course.instructor,
                )

    def seed_support_tickets(self, students, instructors, rounds=2):
        # Each round assigns every template to a (deterministically) different
        # user, roughly multiplying ticket volume by `rounds` — subjects repeat
        # across different users, which the model allows (no unique constraint).
        all_users = students + list(instructors)
        for round_num in range(rounds):
            for category, priority, subject in TICKET_SUBJECTS:
                ticket_random = random.Random(f'{subject}-{round_num}')
                user = ticket_random.choice(all_users)
                if SupportTicket.objects.filter(subject=subject, user=user).exists():
                    continue
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
            topic_random = random.Random(course.id)
            topic_titles = topic_random.sample(DISCUSSION_TOPICS, k=min(len(DISCUSSION_TOPICS), topic_random.randint(1, 2)))
            for topic_title in topic_titles:
                if DiscussionTopic.objects.filter(course=course, title=topic_title).exists():
                    continue
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
        for course in courses:
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
        for course in courses:
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

    def seed_feedback(self, students, target=100):
        # Cycle the template pool across students — Feedback has no unique
        # constraint, and get_or_create is scoped by (user, subject), so a
        # repeated subject across different students still creates a new row.
        for i, student in enumerate(students[:target]):
            feedback_type, subject, message = FEEDBACK_TEMPLATES[i % len(FEEDBACK_TEMPLATES)]
            Feedback.objects.get_or_create(
                user=student, subject=subject,
                defaults={'feedback_type': feedback_type, 'message': message, 'rating': random.randint(3, 5)},
            )

    def seed_messages(self, students, instructors, target=100):
        """One conversation per (student, instructor) pair — a student
        message followed by an instructor reply, mirroring a real support
        thread rather than one-off unread emails."""
        instructor_list = list(instructors)
        msg_random = random.Random('messages')
        for i, student in enumerate(students[:target]):
            subject = MESSAGE_SUBJECTS[i % len(MESSAGE_SUBJECTS)]
            instructor = instructor_list[i % len(instructor_list)]

            conversation = None
            for candidate in Conversation.objects.filter(participants__user=student).filter(participants__user=instructor):
                if candidate.participants.count() == 2:
                    conversation = candidate
                    break
            if conversation:
                continue  # already seeded this pair

            conversation = Conversation.objects.create()
            student_read = msg_random.random() < 0.7
            instructor_read = msg_random.random() < 0.5
            ConversationParticipant.objects.create(
                conversation=conversation, user=student,
                last_read_at=timezone.now() if student_read else None,
            )
            ConversationParticipant.objects.create(
                conversation=conversation, user=instructor,
                last_read_at=timezone.now() if instructor_read else None,
            )
            Message.objects.create(
                conversation=conversation, sender=student,
                content=f'{subject}. Could you help clarify this when you have a moment?',
            )
            if msg_random.random() < 0.5:
                Message.objects.create(
                    conversation=conversation, sender=instructor,
                    content="Sure — happy to help. Let's go over it in our next session.",
                )

    def seed_login_history(self, users, target=160):
        history_random = random.Random('login-history')
        devices = [
            'Windows 11 / Chrome 128', 'macOS Sonoma / Safari 17', 'Ubuntu 22.04 / Firefox 129',
            'Android 14 / Chrome Mobile', 'iOS 17 / Safari Mobile', 'Windows 10 / Edge 127',
        ]
        sample_users = history_random.sample(users, k=min(len(users), target))
        for user in sample_users:
            for _ in range(history_random.randint(1, 2)):
                status = history_random.choices(
                    [LoginHistory.LoginStatus.SUCCESSFUL, LoginHistory.LoginStatus.FAILED],
                    weights=[85, 15],
                )[0]
                login_at = timezone.now() - timedelta(
                    days=history_random.randint(0, 60), hours=history_random.randint(0, 23),
                )
                entry = LoginHistory.objects.create(
                    user=user,
                    ip_address=f'{history_random.randint(41, 197)}.{history_random.randint(0, 255)}.{history_random.randint(0, 255)}.{history_random.randint(1, 254)}',
                    device_information=history_random.choice(devices),
                    login_status=status,
                )
                LoginHistory.objects.filter(pk=entry.pk).update(login_at=login_at)

    def seed_tokens(self, users, target=60):
        """Historical password-reset / registration OTPs — kept smaller than
        the general 100+ target since these are one-off action records
        rather than an open-ended activity log like LoginHistory."""
        from accounts.otp import hash_otp

        token_random = random.Random('tokens')
        sample_users = token_random.sample(users, k=min(len(users), target))
        for user in sample_users:
            if OTP.objects.filter(user=user, purpose=OTP.Purpose.PASSWORD_RESET).exists():
                continue
            created_at = timezone.now() - timedelta(days=token_random.randint(1, 90))
            used = token_random.random() < 0.6
            otp = OTP.objects.create(
                user=user, purpose=OTP.Purpose.PASSWORD_RESET,
                otp_hash=hash_otp(f'{token_random.randint(0, 999999):06d}'),
                expires_at=created_at + timedelta(minutes=10),
                used=used,
                used_at=created_at + timedelta(minutes=token_random.randint(1, 9)) if used else None,
            )
            OTP.objects.filter(pk=otp.pk).update(created_at=created_at)
        for user in sample_users[:40]:
            if OTP.objects.filter(user=user, purpose=OTP.Purpose.REGISTRATION).exists():
                continue
            created_at = timezone.now() - timedelta(days=token_random.randint(1, 90))
            verified = token_random.random() < 0.8
            otp = OTP.objects.create(
                user=user, purpose=OTP.Purpose.REGISTRATION,
                otp_hash=hash_otp(f'{token_random.randint(0, 999999):06d}'),
                expires_at=created_at + timedelta(minutes=10),
                used=verified,
                used_at=created_at + timedelta(minutes=token_random.randint(1, 9)) if verified else None,
            )
            OTP.objects.filter(pk=otp.pk).update(created_at=created_at)

    def seed_role_permissions(self, users):
        """Role/Permission/RolePermission/UserRole are a legacy RBAC scaffold
        not consulted anywhere in accounts.permissions (which checks
        user_type directly) — seeded here purely so every model has demo
        rows, not because the app reads them."""
        permission_codes = [
            ('View Courses', 'view_course'), ('Create Course', 'create_course'), ('Edit Course', 'edit_course'),
            ('Delete Course', 'delete_course'), ('Publish Course', 'publish_course'), ('Manage Users', 'manage_users'),
            ('Manage Content', 'manage_content'), ('Grade Assignment', 'grade_assignment'),
            ('Manage Payments', 'manage_payments'), ('View Reports', 'view_reports'),
            ('Manage Live Classes', 'manage_live_classes'), ('Moderate Discussions', 'moderate_discussions'),
            ('Manage Certificates', 'manage_certificates'), ('Manage Notifications', 'manage_notifications'),
            ('Manage Support Tickets', 'manage_support_tickets'), ('Manage Categories', 'manage_categories'),
            ('Manage Enrollments', 'manage_enrollments'), ('Issue Refunds', 'issue_refunds'),
            ('Manage Reviews', 'manage_reviews'), ('Manage Announcements', 'manage_announcements'),
        ]
        permissions = {code: Permission.objects.get_or_create(code=code, defaults={'name': name})[0] for name, code in permission_codes}

        role_permission_map = {
            User.UserType.ADMIN: list(permissions.keys()),
            User.UserType.ACADEMIC_MANAGER: [
                'view_course', 'create_course', 'edit_course', 'publish_course', 'manage_content',
                'manage_enrollments', 'view_reports', 'manage_live_classes', 'moderate_discussions',
                'manage_announcements',
            ],
            User.UserType.INSTRUCTOR: [
                'view_course', 'create_course', 'edit_course', 'manage_content', 'grade_assignment',
                'manage_live_classes', 'moderate_discussions', 'manage_announcements',
            ],
            User.UserType.CONTENT_MANAGER: [
                'view_course', 'edit_course', 'manage_content', 'manage_categories', 'manage_announcements',
                'moderate_discussions', 'manage_reviews', 'manage_notifications',
            ],
            User.UserType.SUPPORT_STAFF: [
                'view_course', 'manage_support_tickets', 'manage_notifications', 'issue_refunds',
                'manage_payments', 'manage_enrollments',
            ],
            User.UserType.STUDENT: ['view_course'],
        }
        roles = {}
        for user_type, codes in role_permission_map.items():
            role, _ = Role.objects.get_or_create(
                name=User.UserType(user_type).label, defaults={'description': f'{User.UserType(user_type).label} role.'},
            )
            roles[user_type] = role
            for code in codes:
                RolePermission.objects.get_or_create(role=role, permission=permissions[code])

        for user in users:
            role = roles.get(user.user_type)
            if role:
                UserRole.objects.get_or_create(user=user, role=role)

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
            for module in CourseModule.objects.filter(unit__course=course).order_by('order'):
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

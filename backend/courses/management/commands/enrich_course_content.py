import random

from django.core.management.base import BaseCommand
from django.db import transaction

from assessments.models import QuestionOption, Quiz, QuizQuestion
from assignments.models import Assignment
from courses.content_bank import ASSIGNMENTS, CONCEPTS, LANGUAGE_BY_COURSE_TITLE, QUESTIONS
from courses.models import Course, CourseModule
from lessons.models import Lesson

PLACEHOLDER_PREFIX = 'Lesson content for'
PLACEHOLDER_ASSIGNMENT_DESC_PREFIX = 'Apply what you learned in'


INTRO_TEMPLATES = {
    Lesson.LessonType.VIDEO: [
        "In this video, you'll explore **{lesson}**, part of {module} in {course}.{lang}",
        "This video walks through **{lesson}**, building on what you've covered so far in {module}.{lang}",
        "Press play and follow along as we break down **{lesson}** — a core piece of {module} in {course}.{lang}",
    ],
    Lesson.LessonType.LIVE_SESSION: [
        "This live session covers **{lesson}**, part of {module}. Come ready to ask questions and apply what "
        "you've learned so far in {course}.{lang}",
        "Join this session on **{lesson}** for real-time discussion and Q&A around {module} in {course}.{lang}",
    ],
    Lesson.LessonType.AUDIO: [
        "This audio lesson walks through **{lesson}**, continuing the {module} module of {course}.{lang}",
        "Listen in as we unpack **{lesson}**, part of {module} in {course}.{lang}",
    ],
    'link': [
        "This resource covers **{lesson}**, supporting the {module} module of {course}.{lang}",
        "Use this resource to go deeper on **{lesson}**, part of {module} in {course}.{lang}",
    ],
    'default': [
        "This lesson covers **{lesson}**, part of {module} in {course}.{lang}",
        "Let's dig into **{lesson}**, the next step in {module} within {course}.{lang}",
        "Here's what you need to know about **{lesson}**, part of {module} in {course}.{lang}",
    ],
}

LIST_HEADINGS = {
    Lesson.LessonType.VIDEO: ['What To Watch For', 'Key Moments'],
    Lesson.LessonType.LIVE_SESSION: ['Session Agenda', "What We'll Cover"],
    Lesson.LessonType.AUDIO: ['Episode Notes', 'What To Listen For'],
    'link': ['What This Covers', 'Key Takeaways'],
    'default': ['Key Concepts', 'What You Need To Know'],
}

WHY_HEADINGS = ['Why It Matters', 'Why This Is Worth Knowing', 'The Bigger Picture']
RECAP_HEADINGS = ['Quick Recap', 'Before You Move On', 'Takeaway']

TRY_IT_PROMPTS = [
    "Before moving on, take five minutes to explain **{concept}** out loud, in your own words, as if teaching "
    "a colleague — it's the fastest way to spot gaps in your understanding.",
    "As a quick check, jot down one real situation from your own work or studies where **{concept}** would apply.",
    "Pause here and try to think of a counter-example — a case where ignoring **{concept}** would cause a "
    "real problem. It'll make the idea stick.",
]


def build_lesson_content(lesson, module, course, concepts, language):
    """Structured, category-aware lesson content: a varied intro (picked from
    several phrasings per lesson type), a concept list, a "why it matters"
    note, an optional practice prompt, and a recap — instead of one fixed
    boilerplate template repeated for every lesson."""
    rng = random.Random(f'lesson-content-{lesson.id}')
    num_bullets = rng.choice([2, 3, 3, 4])
    bullets = rng.sample(concepts, k=min(num_bullets, len(concepts)))
    why_lead, why_text = rng.choice(concepts)

    lang_note = f" You'll build practical {language} skills you can use right away." if language else ''

    template_key = lesson.lesson_type if lesson.lesson_type in INTRO_TEMPLATES else (
        'link' if lesson.lesson_type in (Lesson.LessonType.EXTERNAL_LINK, Lesson.LessonType.PRESENTATION) else 'default'
    )
    intro_template = rng.choice(INTRO_TEMPLATES[template_key])
    intro = intro_template.format(lesson=lesson.title, module=module.title, course=course.title, lang=lang_note)
    list_heading = rng.choice(LIST_HEADINGS[template_key])

    bullet_lines = '\n'.join(f'- **{lead}.** {text}' for lead, text in bullets)

    sections = [
        intro,
        f"## {list_heading}\n\n{bullet_lines}",
        f"## {rng.choice(WHY_HEADINGS)}\n\n{why_text}",
    ]

    if rng.random() < 0.5:
        practice_concept, _ = rng.choice(bullets)
        sections.append(f"## Try It Yourself\n\n{rng.choice(TRY_IT_PROMPTS).format(concept=practice_concept)}")

    recap_lead = bullets[0][0] if bullets else why_lead
    sections.append(
        f"## {rng.choice(RECAP_HEADINGS)}\n\n"
        f"By the end of **{lesson.title}**, you should be able to apply {recap_lead.lower()} within the context of {module.title}."
    )

    return '\n\n'.join(sections)


class Command(BaseCommand):
    help = (
        "Replaces placeholder lesson content and generic quiz questions with real, "
        "category-appropriate material, and ensures every module has a quiz and every "
        "course has an applied assignment. Safe to re-run — only touches lessons that "
        "are still empty or hold the original placeholder text, and skips quizzes/"
        "assignments that already exist."
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

        lessons_updated = 0
        quizzes_upgraded = 0
        module_quizzes_created = 0
        assignments_created = 0
        skipped_categories = set()

        for course in courses:
            category_name = course.category.name
            if category_name not in CONCEPTS or category_name not in QUESTIONS:
                skipped_categories.add(category_name)
                continue

            with transaction.atomic():
                concepts = CONCEPTS[category_name]
                bank = QUESTIONS[category_name]
                language = LANGUAGE_BY_COURSE_TITLE.get(course.title)

                lessons_updated += self.enrich_lessons(course, concepts, language)

                used_indices = set()
                if self.upgrade_course_quiz(course, bank, used_indices):
                    quizzes_upgraded += 1
                module_quizzes_created += self.add_module_quizzes(course, bank, used_indices)
                if self.add_assignment(course, category_name):
                    assignments_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Lessons enriched: {lessons_updated}\n'
            f'Course quizzes upgraded: {quizzes_upgraded}\n'
            f'Module quizzes created: {module_quizzes_created}\n'
            f'Assignments created: {assignments_created}'
        ))
        if skipped_categories:
            self.stdout.write(self.style.WARNING(f'Skipped (no content bank): {sorted(skipped_categories)}'))

    def enrich_lessons(self, course, concepts, language):
        updated = 0
        modules = CourseModule.objects.filter(unit__course=course).select_related('unit')
        for module in modules:
            for lesson in module.lessons.all():
                if lesson.content and not lesson.content.startswith(PLACEHOLDER_PREFIX):
                    continue
                lesson.content = build_lesson_content(lesson, module, course, concepts, language)
                lesson.save(update_fields=['content'])
                updated += 1
        return updated

    def upgrade_course_quiz(self, course, bank, used_indices):
        quiz = Quiz.objects.filter(course=course, module__isnull=True).order_by('id').first()
        if not quiz:
            quiz = Quiz.objects.create(
                course=course,
                title=f'{course.title} - Knowledge Check',
                status=Quiz.Status.PUBLISHED,
                created_by=course.instructor,
            )

        mc_questions = list(quiz.questions.filter(question_type=QuizQuestion.QuestionType.MULTIPLE_CHOICE))
        needs_upgrade = not mc_questions or any(
            q.question_text.startswith('Sample question') for q in mc_questions
        )
        if not needs_upgrade:
            return False

        rng = random.Random(f'course-quiz-{course.id}')
        n = min(5, len(bank))
        indices = rng.sample(range(len(bank)), k=n)
        used_indices.update(indices)

        for q in mc_questions:
            q.delete()

        total_marks = 0
        for order, idx in enumerate(indices):
            item = bank[idx]
            question = QuizQuestion.objects.create(
                quiz=quiz, question_text=item['q'], question_type=QuizQuestion.QuestionType.MULTIPLE_CHOICE,
                marks=10, order=order, explanation=item['explanation'],
            )
            for o_index, opt_text in enumerate(item['options']):
                QuestionOption.objects.create(
                    question=question, option_text=opt_text, is_correct=(o_index == item['correct']), order=o_index,
                )
            total_marks += 10

        short = quiz.questions.filter(question_type=QuizQuestion.QuestionType.SHORT_ANSWER).first()
        reflection_text = f"In your own words, explain how you would apply one key idea from {course.title} in a real situation."
        if short:
            short.question_text = reflection_text
            short.order = len(indices)
            short.marks = 10
            short.save(update_fields=['question_text', 'order', 'marks'])
        else:
            QuizQuestion.objects.create(
                quiz=quiz, question_text=reflection_text, question_type=QuizQuestion.QuestionType.SHORT_ANSWER,
                marks=10, order=len(indices),
            )
        total_marks += 10

        quiz.description = f"Test your understanding of the core concepts in {course.title}."
        quiz.instructions = 'Answer each question to check your understanding. You can retake this quiz if needed.'
        quiz.total_marks = total_marks
        quiz.passing_marks = max(1, round(total_marks * 0.6))
        quiz.save(update_fields=['description', 'instructions', 'total_marks', 'passing_marks'])
        return True

    def add_module_quizzes(self, course, bank, used_indices):
        created = 0
        modules = CourseModule.objects.filter(unit__course=course).order_by('unit__order', 'order')
        for module in modules:
            if Quiz.objects.filter(module=module).exists():
                continue

            available = [i for i in range(len(bank)) if i not in used_indices] or list(range(len(bank)))
            rng = random.Random(f'module-quiz-{module.id}')
            n = min(5, len(available))
            indices = rng.sample(available, k=n)
            used_indices.update(indices)

            quiz = Quiz.objects.create(
                course=course, module=module,
                title=f'{module.title} Quiz',
                description=f'A quick check on the key ideas from {module.title}.',
                instructions='Answer each question to check your understanding of this module.',
                duration_minutes=15, attempt_limit=3,
                status=Quiz.Status.PUBLISHED, created_by=course.instructor,
            )
            total_marks = 0
            for order, idx in enumerate(indices):
                item = bank[idx]
                question = QuizQuestion.objects.create(
                    quiz=quiz, question_text=item['q'], question_type=QuizQuestion.QuestionType.MULTIPLE_CHOICE,
                    marks=20, order=order, explanation=item['explanation'],
                )
                for o_index, opt_text in enumerate(item['options']):
                    QuestionOption.objects.create(
                        question=question, option_text=opt_text, is_correct=(o_index == item['correct']), order=o_index,
                    )
                total_marks += 20
            quiz.total_marks = total_marks
            quiz.passing_marks = max(1, round(total_marks * 0.6))
            quiz.save(update_fields=['total_marks', 'passing_marks'])
            created += 1
        return created

    def add_assignment(self, course, category_name):
        template = ASSIGNMENTS.get(category_name)
        if not template:
            return False

        # seed_data.py already gives every course one generic placeholder
        # assignment ("Apply what you learned in {course} ...", with a
        # separately backfilled generic instructions string) — upgrade that
        # one in place instead of creating a duplicate.
        assignment = Assignment.objects.filter(course=course).order_by('id').first()
        if assignment:
            if not assignment.description.startswith(PLACEHOLDER_ASSIGNMENT_DESC_PREFIX):
                return False
            assignment.title = template['title']
            assignment.description = template['description']
            assignment.instructions = template['instructions']
            assignment.save(update_fields=['title', 'description', 'instructions'])
            return True

        Assignment.objects.create(
            course=course,
            title=template['title'],
            description=template['description'],
            instructions=template['instructions'],
            maximum_marks=100,
            passing_marks=60,
            submission_type=Assignment.SubmissionType.FILE_AND_TEXT,
            status=Assignment.Status.PUBLISHED,
            created_by=course.instructor,
        )
        return True

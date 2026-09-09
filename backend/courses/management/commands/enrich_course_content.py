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


def build_lesson_content(lesson, module, course, concepts, language):
    """Structured, category-aware lesson content: an intro (varies by lesson
    type), a short concept list, a "why it matters" note, and a recap —
    instead of one boilerplate sentence."""
    rng = random.Random(f'lesson-content-{lesson.id}')
    bullets = rng.sample(concepts, k=min(3, len(concepts)))
    why_lead, why_text = rng.choice(concepts)

    lang_note = f" You'll build practical {language} skills you can use right away." if language else ''

    if lesson.lesson_type == Lesson.LessonType.VIDEO:
        intro = f"In this video, you'll explore **{lesson.title}**, part of {module.title} in {course.title}.{lang_note}"
        list_heading = 'What To Watch For'
    elif lesson.lesson_type == Lesson.LessonType.LIVE_SESSION:
        intro = (
            f"This live session covers **{lesson.title}**, part of {module.title}. Come ready to ask questions "
            f"and apply what you've learned so far in {course.title}.{lang_note}"
        )
        list_heading = 'Session Agenda'
    elif lesson.lesson_type == Lesson.LessonType.AUDIO:
        intro = f"This audio lesson walks through **{lesson.title}**, continuing the {module.title} module of {course.title}.{lang_note}"
        list_heading = 'Episode Notes'
    elif lesson.lesson_type in (Lesson.LessonType.EXTERNAL_LINK, Lesson.LessonType.PRESENTATION):
        intro = f"This resource covers **{lesson.title}**, supporting the {module.title} module of {course.title}.{lang_note}"
        list_heading = 'What This Covers'
    else:
        intro = f"This lesson covers **{lesson.title}**, part of {module.title} in {course.title}.{lang_note}"
        list_heading = 'Key Concepts'

    bullet_lines = '\n'.join(f'- **{lead}.** {text}' for lead, text in bullets)

    return (
        f"{intro}\n\n"
        f"## {list_heading}\n\n"
        f"{bullet_lines}\n\n"
        f"## Why It Matters\n\n"
        f"{why_text}\n\n"
        f"## Quick Recap\n\n"
        f"By the end of **{lesson.title}**, you should be able to apply {why_lead.lower()} within the context of {module.title}."
    )


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

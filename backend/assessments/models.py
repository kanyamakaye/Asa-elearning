from django.conf import settings
from django.db import models


class Quiz(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CLOSED = 'closed', 'Closed'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='quizzes')
    module = models.ForeignKey(
        'courses.CourseModule', on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes'
    )
    lesson = models.ForeignKey(
        'lessons.Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    total_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=50)
    attempt_limit = models.PositiveIntegerField(default=1)
    shuffle_questions = models.BooleanField(default=False)
    show_answers = models.BooleanField(default=True)
    available_from = models.DateTimeField(null=True, blank=True)
    available_until = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='quizzes_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        MULTIPLE_SELECT = 'multiple_select', 'Multiple Select'
        TRUE_FALSE = 'true_false', 'True/False'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        ESSAY = 'essay', 'Essay'
        MATCHING = 'matching', 'Matching'
        FILL_BLANK = 'fill_blank', 'Fill in the Blank'

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MULTIPLE_CHOICE)
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:60]


class QuestionOption(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.option_text[:60]


class QuizAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        SUBMITTED = 'submitted', 'Submitted'
        GRADED = 'graded', 'Graded'

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    attempt_number = models.PositiveIntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    passed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.student} attempt #{self.attempt_number} on {self.quiz}'


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.ForeignKey(
        QuestionOption, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    answer_text = models.TextField(blank=True)
    marks_awarded = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_correct = models.BooleanField(default=False)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_quiz_answers'
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Answer to {self.question} in {self.attempt}'


class Exam(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    exam_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    total_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=50)
    attempt_limit = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='exams_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Grade(models.Model):
    class AssessmentType(models.TextChoices):
        QUIZ = 'quiz', 'Quiz'
        ASSIGNMENT = 'assignment', 'Assignment'
        EXAM = 'exam', 'Exam'
        PROJECT = 'project', 'Project'
        PARTICIPATION = 'participation', 'Participation'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='grades')
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices)
    assessment_id = models.PositiveIntegerField(null=True, blank=True)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    maximum_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    letter_grade = models.CharField(max_length=2, blank=True)
    remarks = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='grades_given'
    )
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-graded_at']

    def save(self, *args, **kwargs):
        if self.maximum_marks:
            self.percentage = round((self.marks_obtained / self.maximum_marks) * 100, 2)
        if not self.letter_grade:
            self.letter_grade = self._compute_letter_grade()
        super().save(*args, **kwargs)

    def _compute_letter_grade(self):
        p = self.percentage
        if p >= 90:
            return 'A'
        if p >= 80:
            return 'B'
        if p >= 70:
            return 'C'
        if p >= 60:
            return 'D'
        return 'F'

    def __str__(self):
        return f'{self.student} - {self.course} ({self.letter_grade})'

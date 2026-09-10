"""Builds a student's academic transcript — an aggregated record of every
course they've taken, with the grade earned and hours completed, distinct
from a single course's completion certificate. Shared by the JSON transcript
endpoint and the PDF renderer so both read the exact same numbers.
"""

from assessments.models import QuizAttempt

from .models import Enrollment


def _letter_grade(percentage):
    if percentage >= 90:
        return 'A'
    if percentage >= 80:
        return 'B'
    if percentage >= 70:
        return 'C'
    if percentage >= 60:
        return 'D'
    return 'F'


def _course_grade(student, course):
    """Average of the student's best attempt on each of the course's quizzes
    (module quizzes and the final assessment alike) — mirrors how a real
    transcript blends multiple graded components into one course grade."""
    attempts = QuizAttempt.objects.filter(
        student=student, quiz__course=course, status__in=[QuizAttempt.Status.SUBMITTED, QuizAttempt.Status.GRADED],
    ).values('quiz_id', 'percentage')
    if not attempts:
        return None
    best_per_quiz = {}
    for a in attempts:
        best_per_quiz[a['quiz_id']] = max(best_per_quiz.get(a['quiz_id'], 0), float(a['percentage']))
    percentage = round(sum(best_per_quiz.values()) / len(best_per_quiz), 2)
    return {'percentage': percentage, 'letter_grade': _letter_grade(percentage)}


def build_transcript(student):
    enrollments = (
        Enrollment.objects.filter(student=student)
        .select_related('course', 'course__category', 'course__instructor')
        .order_by('created_at')
    )

    courses = []
    for enrollment in enrollments:
        course = enrollment.course
        grade = _course_grade(student, course)
        courses.append({
            'course_id': course.id,
            'course_title': course.title,
            'category': course.category.name if course.category else None,
            'level': course.get_level_display(),
            'duration_hours': course.duration_hours,
            'instructor_name': course.instructor.full_name if course.instructor_id else None,
            'status': enrollment.status,
            'enrolled_at': enrollment.created_at,
            'completed_at': enrollment.completed_at,
            'completion_percentage': float(enrollment.completion_percentage),
            'grade_percentage': grade['percentage'] if grade else None,
            'letter_grade': grade['letter_grade'] if grade else None,
            'certificate_issued': enrollment.certificate_issued,
        })

    graded = [c for c in courses if c['grade_percentage'] is not None]
    completed = [c for c in courses if c['status'] == Enrollment.Status.COMPLETED or c['certificate_issued']]
    summary = {
        'total_courses': len(courses),
        'completed_courses': len(completed),
        'total_hours_completed': sum(c['duration_hours'] for c in completed),
        'overall_average': round(sum(c['grade_percentage'] for c in graded) / len(graded), 2) if graded else None,
        'certificates_earned': sum(1 for c in courses if c['certificate_issued']),
    }
    return {'student': student, 'courses': courses, 'summary': summary}

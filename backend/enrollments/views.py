from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from courses.models import Course

from .models import Enrollment
from .rendering import generate_transcript_pdf
from .serializers import EnrollmentSerializer
from .transcript import build_transcript

MANAGER_TYPES = ('admin', 'instructor', 'academic_manager')


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['student__username', 'student__email', 'course__title']

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related('student', 'course')
        course_id = self.request.query_params.get('course')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        if user.user_type == 'admin' or user.is_staff:
            return qs.filter(course_id=course_id) if course_id else qs
        if user.user_type == 'instructor':
            qs = qs.filter(course__instructor=user)
        else:
            qs = qs.filter(student=user)
        # Lets a student/instructor check "am I already enrolled in course X"
        # with one filtered request instead of paging through their whole list.
        return qs.filter(course_id=course_id) if course_id else qs

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        course = Course.objects.filter(pk=course_id).first()
        if not course:
            raise ValidationError({'course': 'Course not found.'})
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            raise ValidationError({'course': 'You are already enrolled in this course.'})
        if course.enrollment_limit and course.enrollments.count() >= course.enrollment_limit:
            raise ValidationError({'course': 'This course has reached its enrollment limit.'})
        if course.prerequisite_id and not Enrollment.objects.filter(
            student=request.user, course_id=course.prerequisite_id, status=Enrollment.Status.COMPLETED,
        ).exists():
            raise ValidationError({
                'course': f'You must complete "{course.prerequisite.title}" before enrolling in this course.',
            })

        enrollment = Enrollment.objects.create(student=request.user, course=course)
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    def _resolve_transcript_student(self, request):
        """Students always see their own transcript; a manager can pass
        ?student=<id> to pull up someone else's."""
        student_id = request.query_params.get('student')
        if not student_id or int(student_id) == request.user.id:
            return request.user
        if request.user.user_type not in MANAGER_TYPES and not request.user.is_staff:
            raise PermissionDenied("You can only view your own transcript.")
        User = get_user_model()
        student = User.objects.filter(pk=student_id).first()
        if not student:
            raise ValidationError({'student': 'Student not found.'})
        return student

    @action(detail=False, methods=['get'])
    def transcript(self, request):
        """The signed-in student's full academic record — every course
        they've enrolled in, with hours, grade, and certificate status.
        Managers can pass ?student=<id> to pull up another student's."""
        student = self._resolve_transcript_student(request)
        data = build_transcript(student)
        return Response({
            'student': {'id': student.id, 'full_name': student.full_name, 'email': student.email},
            'summary': data['summary'],
            'courses': data['courses'],
        })

    @action(detail=False, methods=['get'], url_path='transcript/pdf')
    def transcript_pdf(self, request):
        student = self._resolve_transcript_student(request)
        data = build_transcript(student)
        pdf_bytes = generate_transcript_pdf(data)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{student.username}-transcript.pdf"'
        return response

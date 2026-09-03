from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from courses.models import Course

from .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related('student', 'course')
        if user.user_type == 'admin' or user.is_staff:
            course_id = self.request.query_params.get('course')
            return qs.filter(course_id=course_id) if course_id else qs
        if user.user_type == 'instructor':
            return qs.filter(course__instructor=user)
        return qs.filter(student=user)

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        course = Course.objects.filter(pk=course_id).first()
        if not course:
            raise ValidationError({'course': 'Course not found.'})
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            raise ValidationError({'course': 'You are already enrolled in this course.'})
        if course.enrollment_limit and course.enrollments.count() >= course.enrollment_limit:
            raise ValidationError({'course': 'This course has reached its enrollment limit.'})

        enrollment = Enrollment.objects.create(student=request.user, course=course)
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

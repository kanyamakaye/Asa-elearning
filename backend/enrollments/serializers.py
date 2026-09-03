from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.serializers import CourseListSerializer

from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'course_detail', 'status', 'completion_percentage',
            'completed_at', 'final_grade', 'certificate_issued', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'student', 'completion_percentage', 'completed_at', 'final_grade',
            'certificate_issued', 'created_at', 'updated_at',
        ]

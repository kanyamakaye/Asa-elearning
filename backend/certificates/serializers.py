from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.serializers import CourseListSerializer

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'student', 'course', 'course_detail', 'enrollment',
            'issue_date', 'certificate_file', 'verification_code', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'certificate_number', 'issue_date', 'verification_code', 'created_at']


class CertificateVerifySerializer(serializers.Serializer):
    verification_code = serializers.CharField()

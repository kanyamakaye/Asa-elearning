from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.serializers import CourseListSerializer

from .models import Badge, Certificate, UserBadge


class CertificateSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)
    course_detail = CourseListSerializer(source='course', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'student', 'course', 'course_detail', 'enrollment',
            'issue_date', 'expires_at', 'is_expired', 'renewed_at', 'renewal_count',
            'certificate_file', 'verification_code', 'status', 'created_at',
        ]
        read_only_fields = [
            'id', 'certificate_number', 'issue_date', 'expires_at', 'is_expired',
            'renewed_at', 'renewal_count', 'verification_code', 'created_at',
        ]


class CertificateVerifySerializer(serializers.Serializer):
    verification_code = serializers.CharField()


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'trigger', 'created_at']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True, default=None)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'course', 'course_title', 'awarded_at']

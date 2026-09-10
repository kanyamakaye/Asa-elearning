from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import StudentGroup, StudentGroupMembership

User = get_user_model()


class StudentGroupMembershipSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        source='student', queryset=User.objects.filter(user_type='student'), write_only=True,
    )

    class Meta:
        model = StudentGroupMembership
        fields = ['id', 'group', 'student', 'student_id', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class StudentGroupSerializer(serializers.ModelSerializer):
    instructor_detail = UserPublicSerializer(source='instructor', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True, default=None)
    member_count = serializers.IntegerField(source='memberships.count', read_only=True)

    class Meta:
        model = StudentGroup
        fields = [
            'id', 'name', 'description', 'course', 'course_title', 'instructor', 'instructor_detail',
            'member_count', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_course(self, value):
        request = self.context.get('request')
        user = request.user if request else None
        if value and user and not (user.is_staff or user.user_type in ('admin', 'academic_manager')):
            if value.instructor_id != user.id:
                raise serializers.ValidationError('You can only create groups for your own courses.')
        return value


class StudentGroupDetailSerializer(StudentGroupSerializer):
    memberships = StudentGroupMembershipSerializer(many=True, read_only=True)

    class Meta(StudentGroupSerializer.Meta):
        fields = StudentGroupSerializer.Meta.fields + ['memberships']

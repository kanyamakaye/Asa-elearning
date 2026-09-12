from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.models import Course

from .models import GroupCourseAssignment, StudentGroup, StudentGroupMembership

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


class GroupCourseBriefSerializer(serializers.ModelSerializer):
    """Minimal course representation for nesting inside a group — a group
    only needs enough to link to and label the course, not its full detail
    payload (pricing, description, etc.)."""

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'status']


def validate_course_ownership(courses, user):
    if not user or user.is_staff or user.user_type in ('admin', 'academic_manager'):
        return
    for course in courses:
        if course.instructor_id != user.id:
            raise serializers.ValidationError('You can only assign your own courses to a group.')


class StudentGroupSerializer(serializers.ModelSerializer):
    instructor_detail = UserPublicSerializer(source='instructor', read_only=True)
    courses = GroupCourseBriefSerializer(many=True, read_only=True)
    course_ids = serializers.PrimaryKeyRelatedField(
        source='courses', queryset=Course.objects.all(), many=True, write_only=True, required=False,
    )
    member_count = serializers.IntegerField(source='memberships.count', read_only=True)
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = StudentGroup
        fields = [
            'id', 'name', 'description', 'courses', 'course_ids', 'instructor', 'instructor_detail',
            'member_count', 'course_count', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_course_ids(self, courses):
        request = self.context.get('request')
        validate_course_ownership(courses, request.user if request else None)
        return courses

    def create(self, validated_data):
        courses = validated_data.pop('courses', [])
        request = self.context.get('request')
        group = super().create(validated_data)
        if courses:
            group.courses.set(courses, through_defaults={'assigned_by': request.user if request else None})
        return group

    def update(self, instance, validated_data):
        courses = validated_data.pop('courses', None)
        request = self.context.get('request')
        group = super().update(instance, validated_data)
        if courses is not None:
            group.courses.set(courses, through_defaults={'assigned_by': request.user if request else None})
        return group


class StudentGroupDetailSerializer(StudentGroupSerializer):
    memberships = StudentGroupMembershipSerializer(many=True, read_only=True)

    class Meta(StudentGroupSerializer.Meta):
        fields = StudentGroupSerializer.Meta.fields + ['memberships']


class GroupCourseAssignmentSerializer(serializers.ModelSerializer):
    course = GroupCourseBriefSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all(), write_only=True)

    class Meta:
        model = GroupCourseAssignment
        fields = ['id', 'group', 'course', 'course_id', 'assigned_by', 'assigned_at']
        read_only_fields = ['id', 'group', 'assigned_by', 'assigned_at']

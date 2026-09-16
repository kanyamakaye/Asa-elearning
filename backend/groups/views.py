from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from accounts.permissions import CanManageGroups
from common.responses import StandardResponseMixin, success_response

from .models import GroupCourseAssignment, StudentGroup, StudentGroupMembership
from .serializers import (
    GroupCourseAssignmentSerializer,
    StudentGroupDetailSerializer,
    StudentGroupMembershipSerializer,
    StudentGroupSerializer,
    validate_course_ownership,
)

MANAGER_TYPES = ('admin', 'academic_manager')


class StudentGroupViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = StudentGroup.objects.select_related('instructor', 'created_by').prefetch_related('courses').all()
    permission_classes = [CanManageGroups]
    search_fields = ['name', 'description']
    create_message = 'Group created successfully.'
    update_message = 'Group updated successfully.'
    delete_message = 'Group deleted successfully.'

    def get_serializer_class(self):
        return StudentGroupDetailSerializer if self.action == 'retrieve' else StudentGroupSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_staff or user.user_type in MANAGER_TYPES:
            course_id = self.request.query_params.get('course')
            return qs.filter(courses__id=course_id).distinct() if course_id else qs
        if user.user_type == 'instructor':
            return qs.filter(Q(instructor=user) | Q(courses__instructor=user) | Q(created_by=user)).distinct()
        # Students only ever see groups they're actually a member of.
        return qs.filter(memberships__student=user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, instructor=serializer.validated_data.get('instructor') or self.request.user)

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        group = self.get_object()
        self.check_object_permissions(request, group)
        serializer = StudentGroupMembershipSerializer(data={**request.data, 'group': group.id})
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data['student']
        if StudentGroupMembership.objects.filter(group=group, student=student).exists():
            raise ValidationError({'student_id': 'This student is already in the group.'})
        membership = StudentGroupMembership.objects.create(group=group, student=student)
        return success_response(StudentGroupMembershipSerializer(membership).data, 'Student added to the group.', 201)

    @action(detail=True, methods=['post'], url_path='remove-member')
    def remove_member(self, request, pk=None):
        group = self.get_object()
        self.check_object_permissions(request, group)
        student_id = request.data.get('student_id')
        deleted, _ = StudentGroupMembership.objects.filter(group=group, student_id=student_id).delete()
        if not deleted:
            raise ValidationError({'student_id': 'This student is not in the group.'})
        return success_response(None, 'Student removed from the group.')

    @action(detail=True, methods=['post'], url_path='assign-course')
    def assign_course(self, request, pk=None):
        group = self.get_object()
        self.check_object_permissions(request, group)
        serializer = GroupCourseAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.validated_data['course']
        validate_course_ownership([course], request.user)
        if GroupCourseAssignment.objects.filter(group=group, course=course).exists():
            raise ValidationError({'course_id': 'This course is already assigned to the group.'})
        assignment = GroupCourseAssignment.objects.create(group=group, course=course, assigned_by=request.user)
        return success_response(
            GroupCourseAssignmentSerializer(assignment).data, 'Course assigned to the group.', 201,
        )

    @action(detail=True, methods=['post'], url_path='remove-course')
    def remove_course(self, request, pk=None):
        group = self.get_object()
        self.check_object_permissions(request, group)
        course_id = request.data.get('course_id')
        deleted, _ = GroupCourseAssignment.objects.filter(group=group, course_id=course_id).delete()
        if not deleted:
            raise ValidationError({'course_id': 'This course is not assigned to the group.'})
        return success_response(None, 'Course removed from the group.')

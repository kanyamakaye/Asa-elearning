from django.conf import settings
from django.db import models


class StudentGroup(models.Model):
    """A class/cohort of students, with one instructor responsible for it.
    Distinct from Enrollment (student<->course) and CourseInstructor
    (instructor<->course): this is student<->student grouping for
    reporting, communication, and scoped management.

    A group may also be assigned one or more courses (see
    GroupCourseAssignment / the `courses` M2M below) — per Group.md, a
    student who is a member of the group is thereby authorized to access
    every course assigned to it, in addition to any access they already
    have through normal enrollment (see courses.access.can_access_course).
    A group with no assigned courses grants no course access by itself —
    it's a plain cohort with no bearing on course authorization."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    courses = models.ManyToManyField(
        'courses.Course', through='GroupCourseAssignment', related_name='student_groups', blank=True,
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='groups_managed',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='groups_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class StudentGroupMembership(models.Model):
    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships',
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('group', 'student')
        ordering = ['-joined_at']

    def __str__(self):
        return f'{self.student} in {self.group}'


class GroupCourseAssignment(models.Model):
    """Through-model for StudentGroup.courses — a group is assigned a
    course, granting every current and future member of that group access
    to it (courses.access.can_access_course)."""

    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='course_assignments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='group_assignments')
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_course_assignments_made',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('group', 'course')
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.course} assigned to {self.group}'

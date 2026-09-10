from django.conf import settings
from django.db import models


class StudentGroup(models.Model):
    """A class/cohort of students — optionally scoped to one course (a
    "section" of it) or standalone (a cohort spanning multiple courses),
    with one instructor responsible for it. Distinct from Enrollment
    (student<->course) and CourseInstructor (instructor<->course): this is
    student<->student grouping for reporting, communication, and scoped
    management."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.ForeignKey(
        'courses.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='student_groups',
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

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type == 'admin'))


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.user_type in ('instructor', 'admin'))


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.user_type == 'student')


class IsInstructorOrReadOnly(BasePermission):
    """Anyone can read; only instructors/admins can create or modify."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.user_type in ('instructor', 'admin'))


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type == 'admin'))


class IsOwnerOrReadOnly(BasePermission):
    """Object-level: only the owner (``obj.user``) may write."""

    owner_field = 'user'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user


class IsCourseInstructorOrReadOnly(BasePermission):
    """Object-level: only the course's instructor (or an admin) may write."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.user_type == 'admin' or user.is_staff:
            return True
        course = obj if obj.__class__.__name__ == 'Course' else getattr(obj, 'course', None)
        return bool(course and course.instructor_id == user.id)

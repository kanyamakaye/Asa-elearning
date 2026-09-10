from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type == 'admin'))


class HasRole(BasePermission):
    """Factory: ``HasRole('admin', 'academic_manager')`` -> a permission class."""

    roles = ()

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.roles))


def role_permission(*roles):
    return type('RolePermission', (HasRole,), {'roles': roles})


IsAdminOrAcademicManager = role_permission('admin', 'academic_manager')
IsAdminOrContentManager = role_permission('admin', 'content_manager')
IsAdminOrSupportStaff = role_permission('admin', 'support_staff')


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


class CanManageCourse(BasePermission):
    """Create/list: Admin, Academic Manager, Instructor. Edit: Admin/Academic
    Manager manage any course; Instructors only their own. Students never write."""

    MANAGER_ROLES = ('admin', 'academic_manager')
    WRITE_ROLES = ('admin', 'academic_manager', 'instructor')

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.WRITE_ROLES))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.user_type in self.MANAGER_ROLES:
            return True
        return getattr(obj, 'instructor_id', None) == user.id


class CanManageAssessment(BasePermission):
    """Quizzes & assignments: same role gate as CanManageCourse; object-level
    ownership is resolved via ``created_by`` or the parent course's instructor."""

    MANAGER_ROLES = ('admin', 'academic_manager')
    WRITE_ROLES = ('admin', 'academic_manager', 'instructor')

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.WRITE_ROLES))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.user_type in self.MANAGER_ROLES:
            return True
        owner_id = getattr(obj, 'created_by_id', None)
        # Nested objects (e.g. QuizQuestion, QuestionOption) don't carry
        # `course`/`created_by` directly — walk up to the quiz/assignment parent.
        course = (
            getattr(obj, 'course', None)
            or getattr(getattr(obj, 'quiz', None), 'course', None)
            or getattr(getattr(obj, 'assignment', None), 'course', None)
            or getattr(getattr(getattr(obj, 'question', None), 'quiz', None), 'course', None)
        )
        if owner_id is None:
            owner_id = (
                getattr(getattr(obj, 'quiz', None), 'created_by_id', None)
                or getattr(getattr(obj, 'assignment', None), 'created_by_id', None)
            )
        return owner_id == user.id or bool(course and course.instructor_id == user.id)


class CanManageCourseContent(BasePermission):
    """Modules, lessons ("submodules") and learning resources. Content
    Managers manage content across every course (no ownership check, like
    Admin/Academic Manager) since that's their whole role; Instructors are
    restricted to their own courses via the ownership check below."""

    MANAGER_ROLES = ('admin', 'academic_manager', 'content_manager')
    WRITE_ROLES = ('admin', 'academic_manager', 'content_manager', 'instructor')

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.WRITE_ROLES))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.user_type in self.MANAGER_ROLES:
            return True
        course = (
            getattr(obj, 'course', None)
            or getattr(getattr(obj, 'module', None), 'course', None)
            or getattr(getattr(getattr(obj, 'lesson', None), 'module', None), 'course', None)
        )
        return bool(course and course.instructor_id == user.id)


class CanManageGroups(BasePermission):
    """Student groups/classes: same role gate as CanScheduleLiveClass;
    object-level ownership via ``instructor``. Read access is intentionally
    NOT opened to everyone here — group membership is scoped per-role in
    each view's get_queryset instead, since a student should only ever see
    groups they belong to, not browse every cohort on the platform."""

    MANAGER_ROLES = ('admin', 'academic_manager')
    WRITE_ROLES = ('admin', 'academic_manager', 'instructor')

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(user.is_staff or user.user_type in self.WRITE_ROLES)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.user_type in self.MANAGER_ROLES:
            return True
        return getattr(obj, 'instructor_id', None) == user.id


class CanScheduleLiveClass(BasePermission):
    """Live classes: same role gate; object-level ownership via ``instructor``."""

    MANAGER_ROLES = ('admin', 'academic_manager')
    WRITE_ROLES = ('admin', 'academic_manager', 'instructor')

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.WRITE_ROLES))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.user_type in self.MANAGER_ROLES:
            return True
        return getattr(obj, 'instructor_id', None) == user.id

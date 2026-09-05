from rest_framework.permissions import SAFE_METHODS, BasePermission

MODERATOR_ROLES = ('admin', 'academic_manager', 'instructor', 'content_manager')


class IsTopicOwnerOrModerator(BasePermission):
    """Anyone can read; only the topic's creator or a moderator role may edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (
            obj.created_by_id == user.id or user.is_staff or user.user_type in MODERATOR_ROLES
        ))


class IsReplyOwnerOrModerator(BasePermission):
    """Anyone can read; only the reply's author or a moderator role may edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (
            obj.user_id == user.id or user.is_staff or user.user_type in MODERATOR_ROLES
        ))

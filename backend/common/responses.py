"""Standardized API response envelope, used by the course/quiz/assignment/
live-class creation features (see course.md #42). The rest of the API keeps
returning raw DRF payloads, so this is opt-in via ``StandardResponseMixin``
rather than a global exception handler, to avoid changing the response shape
every existing endpoint and frontend caller already relies on.
"""

from rest_framework import status as http_status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response

from accounts.audit import log_event


def success_response(data=None, message='', status_code=http_status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data}, status=status_code)


def error_response(message='', errors=None, status_code=http_status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message, 'errors': errors or {}}, status=status_code)


class StandardResponseMixin:
    """Wraps create/update/partial_update/destroy in the {success, message,
    data} envelope and converts DRF validation/API errors into the matching
    {success, message, errors} shape."""

    create_message = 'Created successfully.'
    update_message = 'Updated successfully.'
    delete_message = 'Deleted successfully.'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(serializer.data, self.create_message, http_status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(serializer.data, self.update_message)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Optional — the confirm dialog collects it but never requires it, so
        # most deletions still have no reason attached, and that's fine.
        reason = str(request.data.get('reason') or '').strip()
        log_event(
            'RECORD_DELETED',
            user=request.user if request.user.is_authenticated else None,
            request=request,
            model=instance.__class__.__name__,
            object_id=instance.pk,
            object_repr=str(instance)[:200],
            reason=reason,
        )
        self.perform_destroy(instance)
        return success_response(None, self.delete_message, http_status.HTTP_204_NO_CONTENT)

    def handle_exception(self, exc):
        if isinstance(exc, ValidationError):
            detail = exc.detail
            if isinstance(detail, dict):
                errors = detail
                message = 'Validation failed.'
            elif isinstance(detail, list):
                errors = {'non_field_errors': detail}
                message = 'Validation failed.'
            else:
                errors = {'detail': [str(detail)]}
                message = str(detail)
            return error_response(message, errors, exc.status_code)
        if isinstance(exc, APIException):
            return error_response(str(exc.detail), None, exc.status_code)
        return super().handle_exception(exc)

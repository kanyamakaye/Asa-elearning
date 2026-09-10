import re

from django.core.exceptions import ValidationError


class ComplexityValidator:
    """Enforces Authentication.md §6's password policy — at least one
    uppercase, one lowercase, one digit, and one special character — on top
    of Django's built-in length/similarity/common-password validators."""

    def validate(self, password, user=None):
        errors = []
        if not re.search(r'[A-Z]', password):
            errors.append('an uppercase letter')
        if not re.search(r'[a-z]', password):
            errors.append('a lowercase letter')
        if not re.search(r'\d', password):
            errors.append('a number')
        if not re.search(r'[^A-Za-z0-9]', password):
            errors.append('a special character')
        if errors:
            raise ValidationError(f'Password must contain at least {", ".join(errors)}.', code='password_complexity')

    def get_help_text(self):
        return 'Your password must contain an uppercase letter, a lowercase letter, a number, and a special character.'

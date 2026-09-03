from django.contrib import admin

from .forms import RefundForm
from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # PaymentForm (forms.py) is scoped to the checkout flow (amount + method
    # only); the admin needs to see/edit status and provider fields too, so it
    # keeps Django's default full-field form.
    list_display = ('transaction_reference', 'student', 'course', 'amount', 'payment_status')
    list_filter = ('payment_status',)
    search_fields = ('transaction_reference',)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    form = RefundForm
    list_display = ('payment', 'student', 'refund_amount', 'refund_status')
    list_filter = ('refund_status',)

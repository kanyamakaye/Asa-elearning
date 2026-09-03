from django.contrib import admin

from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_reference', 'student', 'course', 'amount', 'payment_status')
    list_filter = ('payment_status',)
    search_fields = ('transaction_reference',)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('payment', 'student', 'refund_amount', 'refund_status')
    list_filter = ('refund_status',)

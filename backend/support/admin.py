from django.contrib import admin

from .models import FAQ, Feedback, SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'category', 'priority', 'status', 'created_at')
    list_filter = ('category', 'priority', 'status')


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'display_order', 'is_active')
    list_filter = ('is_active', 'category')


admin.site.register(Feedback)

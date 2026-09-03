from django.contrib import admin

from .models import CourseReview, Wishlist


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'rating', 'status')
    list_filter = ('status', 'rating')


admin.site.register(Wishlist)

from django.contrib import admin
from .models import SmokingZone, ReportZone


@admin.register(SmokingZone)
class SmokingZoneAdmin(admin.ModelAdmin):
    list_display = ['gu', 'gubun', 'type', 'location', 'manage', 'created_at']
    list_filter = ['gu', 'gubun', 'type', 'created_at']
    search_fields = ['gu', 'location', 'manage']
    ordering = ['-created_at']
    list_per_page = 50


@admin.register(ReportZone)
class ReportZoneAdmin(admin.ModelAdmin):
    list_display = ['gu', 'gubun', 'type', 'location', 'manage', 'created_at']
    list_filter = ['gu', 'gubun', 'type', 'created_at']
    search_fields = ['gu', 'location', 'manage']
    ordering = ['-created_at']
    list_per_page = 50
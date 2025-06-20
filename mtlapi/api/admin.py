from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.contenttypes.models import ContentType
from django.utils.html import format_html
from .models import Event, Activity, Mediafile, Item, Person


# ===============================
# INLINE ДЛЯ МАТЕРИАЛОВ
# ===============================
class MediafileInline(GenericTabularInline):
    model = Mediafile
    extra = 6

# ===============================
# АДМИНКА ДЛЯ СОБЫТИЙ (Event)
# ===============================
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'location')
    list_filter = ('start_date', 'location', 'participants')
    search_fields = ('title', 'description')
    inlines = [MediafileInline]
    filter_horizontal = ('related_events', 'participants',)

    fieldsets = (
        ("Основная информация", {
            'fields': ('title', 'description', 'location')
        }),
        ("Даты", {
            'fields': ('start_date', 'end_date')
        }),
        ("Дополнительно", {
            'fields': ('participants', 'related_events', 'links', 'preview_photo')
        }),
    )

# ===============================
# АДМИНКА ДЛЯ МЕРОПРИЯТИЙ (Activity)
# ===============================
@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'event_type', 'location')
    list_filter = ('event_type', 'location', 'start_date')
    search_fields = ('title', 'description')
    inlines = [MediafileInline]
    filter_horizontal = ('items', 'related_activities')

    fieldsets = (
        ("Основная информация", {
            'fields': ('title', 'description', 'location')
        }),
        ("Даты", {
            'fields': ('start_date', 'end_date')
        }),
        ("Тип и связи", {
            'fields': ('event_type', 'related_activities', 'items', 'links', 'preview_photo')
        }),
    )


# ===============================
# АДМИНКА ДЛЯ МЕДИАФАЙЛОВ (Mediafile)
# ===============================
@admin.register(Mediafile)
class MediafileAdmin(admin.ModelAdmin):
    list_display = ('mediafile_type', 'content_object', 'file_path')
    list_filter = ('mediafile_type',)
    search_fields = ('file_path',)

    fieldsets = (
        ("Основная информация", {
            'fields': ('mediafile_type', 'file_path')
        }),
        ("Связь с объектом", {
            'fields': ('content_type', 'object_id')
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "content_type":

            kwargs["queryset"] = ContentType.objects.filter(
                app_label='api',
                model__in=['event', 'activity']
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# ===============================
# АДМИНКА ДЛЯ ПРЕДМЕТОВ (Item)
# ===============================
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'description') 
    search_fields = ('name', 'description') 
    filter_horizontal = ('activities',)  
    fieldsets = (
        ("Основная информация", {
            'fields': ('name', 'description')
        }),
        ("Связи", {
            'fields': ('activities',)
        }),
    )
    
# ===============================
# АДМИНКА ДЛЯ ЛИЧНОСТЕЙ (Person)
# =============================== 
@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('full_name',)
    search_fields = ('full_name',)
    fields = ('full_name',)
    ordering = ('full_name',)
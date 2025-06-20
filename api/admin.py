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
    extra = 3  # Количество пустых форм для добавления новых материалов


# ===============================
# АДМИНКА ДЛЯ СОБЫТИЙ (Event)
# ===============================
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'location')  # Поля для отображения в списке
    list_filter = ('start_date', 'location', 'participants')  # Фильтры справа
    search_fields = ('title', 'description')  # Поля для поиска
    inlines = [MediafileInline]  # Добавление материалов напрямую из события
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
    list_display = ('title', 'start_date', 'end_date', 'event_type', 'location')  # Поля для отображения в списке
    list_filter = ('event_type', 'location', 'start_date')  # Фильтры справа
    search_fields = ('title', 'description')  # Поля для поиска
    inlines = [MediafileInline]  # Добавление материалов напрямую из мероприятия
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
            # Ограничиваем выбор только моделями Event и Activity
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
    list_display = ('name', 'description')  # Поля для отображения в списке
    search_fields = ('name', 'description')  # Поля для поиска

    filter_horizontal = ('activities',)  # Удобный интерфейс для выбора мероприятий

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
    # Поля, которые будут отображаться в списке объектов
    list_display = ('full_name',)

    # Поля, по которым можно выполнять поиск
    search_fields = ('full_name',)

    # Настройка формы редактирования
    fields = ('full_name',)

    # Дополнительные настройки (опционально)
    ordering = ('full_name',)
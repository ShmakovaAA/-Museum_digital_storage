from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType


# ==============================================================
# СОБЫТИЯ
class Event(models.Model):
    #===========================================================
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата добавления"
    )  # 1. Дата создания
    
    title = models.CharField(
        max_length=255,
        verbose_name="Название события",
        help_text="Добавьте название события."
    )  # 2. Название
    
    start_date = models.DateField(
        verbose_name="Дата начала события",
        help_text="Добавьте дату начала события."
    )  # 3. Дата начала
    
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Дата окончания события",
        help_text="Добавьте дату окончания события (необязательно)."
    )  # 4. Дата окончания
    
    location = models.CharField(
        max_length=255,
        verbose_name="Населенный пункт",
        help_text="Добавьте населенный пункт проведения события."
    )  # 5. НП
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание события",
        help_text="Добавьте подробное описание события."
    ) # 6. Описание
    
    participants = models.ManyToManyField(
        'Person',
        blank=True,
        related_name='event_participants',
        verbose_name="Участники события",
        help_text="Выберите участников события."
    )  # 7. Участники
    
    preview_photo = models.ForeignKey(
        'Mediafile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preview_for_event',
        verbose_name="Превью фото",
        help_text="Выберите превью события."
    )  # 9. Превью фото
    
    links = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Ссылки",
        help_text="Добавьте ссылки в формате: [https://link-first.ru, https://link-second.com...]"
    )  # 11. Ссылки
    
    related_events = models.ManyToManyField(
        'Activity',
        blank=True,
        related_name='events_related_to_activity',
        verbose_name="Привязанные мероприятия",
        help_text="Выберите мероприятия привязанные к событию."
    )  # 12. Привязанные мероприятия
    
    mediafiles = GenericRelation('Mediafile')
    #===========================================================

    def clean(self):
        if self.end_date and self.start_date > self.end_date:
            raise ValidationError("Дата окончания не может быть раньше даты начала.")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Событие"
        verbose_name_plural = "События"


# ==============================================================
# МЕРОПРИЯТИЯ
class Activity(models.Model):
    EVENT_TYPE_CHOICES = [
        ('exhibition', 'Выставка'),
        ('seminar', 'Семинар'),
        ('conference', 'Конференция'),
        ('workshop', 'Мастер-класс'),
    ]

    #===========================================================
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата добавления"
    )  # 1. Дата добавления
    
    title = models.CharField(
        max_length=255,
        verbose_name="Название",
        help_text="Добавьте название мероприятия."
    )  # 2. Название
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание",
        help_text="Добавьте описание мероприятия."
    )  # 3. Описание
    
    start_date = models.DateField(
        verbose_name="Дата начала",
        help_text="Добавьте дату начала события."
    ) # 4. Дата открытия (начало)
    
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Дата окончания",
        help_text="Добавьте дату окончания события (необязательно)."
    ) # 5. Дата открытия (конец)
    
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default='exhibition',
        verbose_name="Тип мероприятия",
        help_text="Выберите тип мероприятия."
    )  # 6. Тип мероприятия
    
    location = models.CharField(
        max_length=255,
        verbose_name="Место проведения (НП)",
        help_text="Добавьте населенный пункт проведения события."
    )  # 7. Место проведения
    
    related_activities = models.ManyToManyField(
        'Event',
        blank=True,
        symmetrical=False,
        related_name='activities_related_to_event',
        verbose_name="Привязанные события",
        help_text="Выберите события привязанные к событию."
    )  # 11. Привязанные события
    
    items = models.ManyToManyField(
        'Item',
        blank=True,
        related_name='related_activities',
        verbose_name="Привязанные предметы",
        help_text="Выберите предметы фигурирующие в мероприятии."
    )  # 12. Привязанные предметы
    
    links = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Ссылки",
        help_text="Добавьте ссылки в формате: [https://link-first.ru, https://link-second.com...]"
    )  # 13. Ссылки
    
    preview_photo = models.ForeignKey(
        'Mediafile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preview_for_activities',
        verbose_name="Превью фото",
        help_text="Выберите превью мероприятия."
    )  # 14. Превью фото
    
    mediafiles = GenericRelation('Mediafile')
    #===========================================================

    def clean(self):
        if self.end_date and self.start_date > self.end_date:
            raise ValidationError("Дата окончания не может быть раньше даты начала.")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Мероприятие"
        verbose_name_plural = "Мероприятия"


# ==============================================================
# МЕДИАФАЙЛЫ
def validate_mediafile_type(value):
    if value not in ['photo', 'video', 'document']:
        raise ValidationError("Тип материала должен быть 'photo', 'video' или 'document'.")

class Mediafile(models.Model):
    MEDIAFILE_TYPE_CHOICES = [
        ('photo', 'Фото'),
        ('video', 'Видео'),
        ('document', 'Документ'),
    ]

    #===========================================================
    mediafile_id = models.AutoField(primary_key=True)
    mediafile_type = models.CharField(
        max_length=10,
        choices=MEDIAFILE_TYPE_CHOICES,
        validators=[validate_mediafile_type],
        verbose_name="Тип медиафайла",
        help_text="Выберите тип медиафайла (Фото / Видео / Документ)."
    )  # 1. Тип материала
    
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name="Тип контента",
        help_text="Выберите тип активности (Событие / Мероприятие)."
    )  # 2. Тип объекта (Event или Activity)
    
    object_id = models.PositiveIntegerField(
        verbose_name="ID активности",
        help_text="Добавьте ID события / мероприятия."
    )  # 3. ID активности
    
    content_object = GenericForeignKey('content_type', 'object_id')  # Объект (Event или Activity)
    file_path = models.FileField(
        upload_to='',
        verbose_name="Путь к медиафайлу",
        help_text="Укажите путь к медиафайлу."
    )  # 4. Путь к материалу
    #===========================================================

    def __str__(self):
        if self.content_type:
            return f"{self.get_mediafile_type_display()} для {self.content_object}"
        return f"{self.get_mediafile_type_display()} (без привязки)"

    class Meta:
        verbose_name = "Медифайл"
        verbose_name_plural = "Медиафайлы"


# ==============================================================
# ПРЕДМЕТЫ
class Item(models.Model):
    #===========================================================
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        help_text="Добавьте название предмета."
    )  # 2. Название
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание",
        help_text="Добавьте описание предмета."
    )  # 3. Описание
    
    activities = models.ManyToManyField(
        Activity,
        blank=True,
        related_name='related_items',
        verbose_name="Привязка к мероприятиям",
        help_text="Выберите мероприятие в котором фигурирует предмет."
    )  # 4. Привязка к мероприятиям
    #===========================================================
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"
        
# ==============================================================
# УЧАСТНИКИ
class Person(models.Model):
    full_name = models.CharField(
        max_length=300,
        verbose_name="Личность",
        help_text="Добавьте данные личности."
    ) # 1. Личность
    
    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"
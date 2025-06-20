from rest_framework import serializers
from .models import Event, Person, Mediafile, Item, Activity

# ==============================================================
# МЕДИАФАЙЛЫ
class MediafileSerializer(serializers.ModelSerializer):
    file_path = serializers.ImageField(use_url=True)

    class Meta:
        model = Mediafile
        fields = ('mediafile_id', 'mediafile_type', 'file_path')
        
# ==============================================================
# ПРЕДМЕТЫ       
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'name', 'description')
        
# ==============================================================
# ЛИЧНОСТИ
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ('id', 'full_name')

# ==============================================================
# СОБЫТИЯ
class EventSerializer(serializers.ModelSerializer):
    participants = PersonSerializer(many=True, read_only=True)
    links = serializers.ListField(child=serializers.URLField())
    mediafiles = MediafileSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = (
            'id',
            'created_at',
            'title',
            'start_date',
            'end_date',
            'location',
            'description',
            'participants',
            'preview_photo',
            'links',
            'related_events',
            'mediafiles',
        )
        read_only_fields = ('created_at',)

# ==============================================================
# МЕРОПРИЯТИЯ       
class ActivitySerializer(serializers.ModelSerializer):
    related_activities = EventSerializer(many=True, read_only=True)
    items = ItemSerializer(many=True, read_only=True)
    mediafiles = MediafileSerializer(many=True, read_only=True)
    event_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = (
            'id',
            'created_at',
            'title',
            'description',
            'start_date',
            'end_date',
            'event_type',
            'event_type_display',
            'location',
            'related_activities',
            'items',
            'preview_photo',
            'links',
            'mediafiles',
        )
        read_only_fields = ('created_at',)
        
    def get_event_type_display(self, obj):
        return obj.get_event_type_display()
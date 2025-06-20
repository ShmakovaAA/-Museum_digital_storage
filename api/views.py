#- django
from django.db.models.functions import ExtractYear
from django.db.models import Q, Count
from django.http import JsonResponse
#- rest api
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
#- local
from .models import Event, Activity, Mediafile
from .serializers import EventSerializer, ActivitySerializer, MediafileSerializer


# ==============================================================
# СОБЫТИЯ
class GetEvents(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'], url_path='events-per-year')
    def events_per_year(self, request):
        # Извлекаем параметры запроса
        filter_date = request.query_params.get('filter_date', None)
        filter_location = request.query_params.get('filter_location', None)
        filter_person = request.query_params.get('filter_person', None)

        # Формируем базовый QuerySet
        queryset = Event.objects.all()

        # Применяем фильтры
        if filter_location:
            queryset = queryset.filter(location__icontains=filter_location)

        if filter_person:
            queryset = queryset.filter(participants__full_name__icontains=filter_person)

        # Группируем события по году и считаем их количество
        events_by_year = (
            queryset
            .annotate(year=ExtractYear('start_date'))
            .values('year')
            .annotate(count=Count('id'))
            .order_by('year' if filter_date else '-count')
        )

        # Преобразуем результат в словарь {год: количество}
        result = {item['year']: item['count'] for item in events_by_year}

        # Если результат пуст, возвращаем пустой словарь
        if not result:
            return Response({})

        return Response(result)

    @action(detail=False, methods=['get'], url_path='year/(?P<year>[0-9]{4})')
    def events_by_year(self, request, year=None):
        # Извлекаем параметры запроса
        filter_location = request.query_params.get('filter_location', None)
        filter_person = request.query_params.get('filter_person', None)

        # Фильтруем события по указанному году
        queryset = Event.objects.filter(start_date__year=year)

        # Применяем дополнительные фильтры
        if filter_location:
            queryset = queryset.filter(location__icontains=filter_location)

        if filter_person:
            queryset = queryset.filter(participants__full_name__icontains=filter_person)

        # Сериализуем данные
        serializer = self.get_serializer(queryset, many=True)

        # Если результат пуст, возвращаем пустой массив
        if not serializer.data:
            return Response([])

        return Response(serializer.data)
# ==============================================================
# МЕРОПРИЯТИЯ
class GetActivities(viewsets.ModelViewSet):
    queryset = Activity.objects.all().order_by('-created_at')
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# ==============================================================
# МЕДИАФАЙЛЫ   
class GetMediafile(viewsets.ModelViewSet):
    queryset = Mediafile.objects.all()
    serializer_class = MediafileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'mediafile_id'

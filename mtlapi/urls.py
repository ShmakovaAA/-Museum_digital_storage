#-django
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
#-local
from api import views
from api.views import GetEvents, GetActivities, GetMediafile


urlpatterns = [
    path('admin/', admin.site.urls),
]

# events requests
urlpatterns += [
    path('api/event/', GetEvents.as_view({'get': 'list'}), name='event-list'),
    path('api/event/<int:pk>/', GetEvents.as_view({'get': 'retrieve'}), name='event-detail'),
    path('api/event/year/<int:year>/', GetEvents.as_view({'get': 'events_by_year'}), name='events-by-year'),
    path('api/event/events-per-year/', GetEvents.as_view({'get': 'events_per_year'}), name='events-per-year'),
]

# activities requests
urlpatterns += [
    path('api/activity/', GetActivities.as_view({'get': 'list'}), name='acivity-list'),
    path('api/activity/<int:pk>/', GetActivities.as_view({'get': 'retrieve'}), name='acivity-detail'),
]

# mediafiles requests
urlpatterns += [
    path('api/mediafile/<int:mediafile_id>/', GetMediafile.as_view({'get': 'retrieve'}), name='mediafile-detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

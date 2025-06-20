from django.test import TestCase
from django.utils.timezone import now
from datetime import timedelta
from faker import Faker
from api.models import Event, Material, Activity  

class EventTestCase(TestCase):
    """
    Тесты для модели Event.
    """

    def setUp(self):
        """
        Настройка тестовой среды.
        """
        self.fake = Faker('ru_RU')  # Генерация данных на русском языке
        self.events_count = 5  # Количество событий для тестирования

    def create_random_event(self):
        """
        Создает случайное событие и связанные материалы.
        """
        title = self.fake.sentence(nb_words=4)  # Название события
        start_date = self.fake.date_between(start_date='-30d', end_date='+30d')  # Дата начала
        end_date = self.fake.date_between(start_date=start_date, end_date='+60d') if self.fake.boolean() else None  # Дата окончания
        location = self.fake.city()  # Населенный пункт
        description = self.fake.text(max_nb_chars=200) if self.fake.boolean() else None  # Описание
        participants = [self.fake.name() for _ in range(self.fake.random_int(min=1, max=5))] if self.fake.boolean() else []  # Участники
        links = [self.fake.url() for _ in range(self.fake.random_int(min=1, max=3))] if self.fake.boolean() else []  # Ссылки

        # Создание события
        event = Event.objects.create(
            title=title,
            start_date=start_date,
            end_date=end_date,
            location=location,
            description=description,
            participants=participants,
            links=links,
        )

        # Генерация случайных материалов (фото, видео, документы)
        for _ in range(self.fake.random_int(min=1, max=5)):  # Создаем от 1 до 5 материалов
            material_type = self.fake.random_element(elements=('photo', 'video', 'document'))
            file_path = f"materials/{self.fake.file_name(category='image' if material_type == 'photo' else 'text')}"
            Material.objects.create(
                material_type=material_type,
                content_object=event,  # Связь с событием
                file_path=file_path,
            )

        return event

    def test_create_random_events(self):
        """
        Тест создания случайных событий.
        """
        events = []
        for _ in range(self.events_count):
            event = self.create_random_event()
            events.append(event)

        # Проверка количества созданных событий
        self.assertEqual(Event.objects.count(), self.events_count)

        # Проверка наличия материалов для каждого события
        for event in events:
            materials_count = event.materials.count()
            self.assertGreater(materials_count, 0, f"У события {event.title} должны быть материалы.")

    def test_event_validation(self):
        """
        Тест валидации дат события.
        """
        with self.assertRaises(ValueError):
            Event.objects.create(
                title=self.fake.sentence(nb_words=4),
                start_date=now().date(),
                end_date=now().date() - timedelta(days=1),  # Дата окончания раньше даты начала
                location=self.fake.city(),
            )
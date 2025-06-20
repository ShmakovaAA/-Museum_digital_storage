import sqlite3
import random
from datetime import datetime, timedelta
from faker import Faker
import json  # Импортируем модуль для работы с JSON

# Инициализация Faker
fake = Faker('ru_RU')  # Генерация данных на русском языке

# Подключение к базе данных SQLite
DB_PATH = 'db.sqlite3'  # Путь к вашей базе данных
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def create_random_event():
    """
    Создает случайное событие.
    """
    title = fake.sentence(nb_words=4)  # Название события
    start_date = fake.date_between(start_date='-30d', end_date='+30d')  # Дата начала (в пределах 30 дней)
    end_date = fake.date_between(start_date=start_date, end_date='+60d') if random.choice([True, False]) else None  # Дата окончания
    location = fake.city()  # Населенный пункт
    description = fake.text(max_nb_chars=200)  # Описание (обязательно)
    
    # Участники (минимум 2)
    participants = [fake.name() for _ in range(random.randint(2, 5))]  # Минимум 2 участника
    
    # Ссылки (минимум 2)
    links = [fake.url() for _ in range(random.randint(2, 5))]  # Минимум 2 ссылки

    # Преобразование данных в JSON
    participants_json = json.dumps(participants)  # Преобразование списка участников в JSON
    links_json = json.dumps(links)  # Преобразование списка ссылок в JSON

    # Преобразование дат в строки для SQLite
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Текущая дата и время
    start_date_str = start_date.strftime('%Y-%m-%d')  # Дата начала
    end_date_str = end_date.strftime('%Y-%m-%d') if end_date else None  # Дата окончания (может быть None)

    # Вставка данных в таблицу
    cursor.execute("""
        INSERT INTO api_event (
            created_at, title, start_date, end_date, location, description,
            participants, preview_photo_id, links
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        created_at,  # created_at
        title,
        start_date_str,
        end_date_str,
        location,
        description,  # Описание (обязательно)
        participants_json,  # Участники в формате JSON
        None,  # preview_photo_id (временно None)
        links_json  # Ссылки в формате JSON
    ))

    print(f"Добавлено событие: {title}")

def add_test_events(count=10):
    """
    Добавляет заданное количество тестовых событий.
    """
    for _ in range(count):
        create_random_event()

    # Сохранение изменений в базе данных
    conn.commit()

if __name__ == "__main__":
    print("Начинаем добавление тестовых событий...")
    add_test_events(count=20)  # Добавляем 20 тестовых событий
    print("Добавление событий завершено.")

    # Закрытие соединения с базой данных
    conn.close()
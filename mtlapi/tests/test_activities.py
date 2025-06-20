import sqlite3
import random
from datetime import datetime, timedelta
from faker import Faker
import json


#======================================================#
#             СОЗДАНИЕ ТЕСТОВЫХ МЕРОПРИЯТИЙ            
#======================================================#

fake = Faker('ru_RU')

DB_PATH = '../db.sqlite3'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def create_random_activity():
    title = fake.sentence(nb_words=4)
    start_date = fake.date_between(
        start_date=datetime(1900, 1, 1),  # Начало диапазона: 1 января 1900 года
        end_date=datetime.today()         # Конец диапазона: сегодняшний день
    )
    end_date = (
        fake.date_between(
            start_date=start_date,        # Начало диапазона: start_date
            end_date=start_date + timedelta(days=60)  # Конец диапазона: +60 дней от start_date
        )
        if random.choice([True, False])
        else None
    )
    event_type = random.choice(['exhibition', 'seminar', 'conference', 'workshop'])
    location = fake.city()
    description = fake.text(max_nb_chars=200)
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d') if end_date else None

    cursor.execute("""
        INSERT INTO api_activity (
            created_at, title, description, start_date, end_date, event_type, location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        created_at,
        title,
        description,
        start_date_str,
        end_date_str,
        event_type,
        location
    ))

    print(f"Добавлено тестовое мероприятие: {title}")

def add_test_activities(count=10):
    for _ in range(count):
        create_random_activity()

    conn.commit()

if __name__ == "__main__":
    print("Начинаем добавление тестовых мероприятий...")
    add_test_activities(count=150)
    print("Добавление тестовых мероприятий завершено.")

    conn.close()
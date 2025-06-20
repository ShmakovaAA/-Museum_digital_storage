import sqlite3
import random, json
from datetime import datetime, timedelta
from faker import Faker


#======================================================#
#             СОЗДАНИЕ ТЕСТОВЫХ СОБЫТИЙ                
#======================================================#

fake = Faker('ru_RU')

DB_PATH = '../db.sqlite3'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def get_random_person_ids():
    cursor.execute("SELECT id FROM api_person")
    person_ids = [row[0] for row in cursor.fetchall()]
    return random.sample(person_ids, k=random.randint(2, min(5, len(person_ids))))

def create_random_event():
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
    location = fake.city()
    description = fake.text(max_nb_chars=200)
    links = [fake.url() for _ in range(random.randint(2, 5))]
    links_json = json.dumps(links)
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d') if end_date else None

    cursor.execute("""
        INSERT INTO api_event (
            created_at, title, start_date, end_date, location, description,
            preview_photo_id, links
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        created_at,
        title,
        start_date_str,
        end_date_str,
        location,
        description,
        None,
        links_json
    ))

    event_id = cursor.lastrowid

    participant_ids = get_random_person_ids()

    for person_id in participant_ids:
        cursor.execute("""
            INSERT INTO api_event_participants (
                event_id, person_id
            )
            VALUES (?, ?)
        """, (event_id, person_id))

    print(f"Добавлено тестовое событие: {title} (ID: {event_id})")

def add_test_events(count=10):
    for _ in range(count):
        create_random_event()

    conn.commit()

if __name__ == "__main__":
    print("Начинаем добавление тестовых событий...")
    add_test_events(count=150)
    print("Добавление тестовых событий завершено.")

    conn.close()
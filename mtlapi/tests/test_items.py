import sqlite3
import random
from faker import Faker


#======================================================#
#             СОЗДАНИЕ ТЕСТОВЫХ ПРЕДМЕТОВ                
#======================================================#

fake = Faker('ru_RU')

DB_PATH = '../db.sqlite3'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def get_random_activities():
    cursor.execute("SELECT id FROM api_activity")
    activity_ids = [row[0] for row in cursor.fetchall()]
    return random.sample(activity_ids, k=random.randint(1, min(5, len(activity_ids))))

def create_random_item():
    name = fake.word().capitalize()
    description = "Тестовый, сгенерированный предмет."

    cursor.execute("""
        INSERT INTO api_item (
            name, description
        )
        VALUES (?, ?)
    """, (name, description))

    item_id = cursor.lastrowid

    activity_ids = get_random_activities()
    for activity_id in activity_ids:
        cursor.execute("""
            INSERT INTO api_item_activities (
                item_id, activity_id
            )
            VALUES (?, ?)
        """, (item_id, activity_id))

    print(f"Добавлен предмет: {name}")

def add_test_items(count=10):
    for _ in range(count):
        create_random_item()

    conn.commit()

if __name__ == "__main__":
    print("Начинаем добавление тестовых предметов...")
    add_test_items(count=200)
    print("Добавление тестовых предметов завершено.")

    conn.close()
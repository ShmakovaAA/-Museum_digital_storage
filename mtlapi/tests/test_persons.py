import sqlite3
from faker import Faker


#======================================================#
#             СОЗДАНИЕ ТЕСТОВЫХ ЛИЧНОСТЕЙ                
#======================================================#

fake = Faker('ru_RU')

DB_PATH = '../db.sqlite3'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def create_random_person():
    full_name = fake.name()

    cursor.execute("""
        INSERT INTO api_person (
            full_name
        )
        VALUES (?)
    """, (full_name,))

    person_id = cursor.lastrowid
    print(f"Добавлена личность: {full_name} (ID: {person_id})")

def add_test_persons(count=10):
    for _ in range(count):
        create_random_person()

    conn.commit()

if __name__ == "__main__":
    print("Начинаем добавление тестовых личностей...")
    add_test_persons(count=200)
    print("Добавление тестовых личностей завершено.")

    conn.close()
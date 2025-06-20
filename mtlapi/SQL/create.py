import sqlite3

# Создаем подключение к базе данных (или создаем новую, если она не существует)
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Создаем таблицы
def create_tables():
    # Таблица api_person (Участники)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_person (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL
        )
    ''')

    # Таблица django_content_type (Типы контента)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS django_content_type (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_label VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL
        )
    ''')

    # Добавляем данные в таблицу django_content_type
    data = [
        ('admin', 'logentry'),
        ('auth', 'permission'),
        ('auth', 'group'),
        ('auth', 'user'),
        ('contenttypes', 'contenttype'),
        ('sessions', 'session'),
        ('api', 'activity'),
        ('api', 'person'),
        ('api', 'event'),
        ('api', 'item'),
        ('api', 'mediafile')
    ]
    cursor.executemany('''
        INSERT OR IGNORE INTO django_content_type (app_label, model) VALUES (?, ?)
    ''', data)

    # Таблица api_mediafile (Медиафайлы)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_mediafile (
            mediafile_id INTEGER PRIMARY KEY AUTOINCREMENT,
            mediafile_type TEXT NOT NULL CHECK(mediafile_type IN ('photo', 'video', 'document')),
            content_type_id INTEGER NOT NULL,
            object_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            FOREIGN KEY (content_type_id) REFERENCES django_content_type(id)
        )
    ''')

    # Таблица api_event (События)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            title TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            location TEXT NOT NULL,
            description TEXT,
            preview_photo_id INTEGER,
            links JSON DEFAULT '[]',
            FOREIGN KEY (preview_photo_id) REFERENCES api_mediafile(mediafile_id)
        )
    ''')

    # Таблица api_activity (Мероприятия)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            title TEXT NOT NULL,
            description TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            event_type TEXT NOT NULL CHECK(event_type IN ('exhibition', 'seminar', 'conference', 'workshop')),
            location TEXT NOT NULL,
            links JSON DEFAULT '[]',
            preview_photo_id INTEGER,
            FOREIGN KEY (preview_photo_id) REFERENCES api_mediafile(mediafile_id)
        )
    ''')

    # Таблица api_item (Предметы)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # Таблица api_item_activities (Связь между предметами и мероприятиями)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_item_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id BIGINT NOT NULL,
            activity_id BIGINT NOT NULL,
            FOREIGN KEY (item_id) REFERENCES api_item(id),
            FOREIGN KEY (activity_id) REFERENCES api_activity(id)
        )
    ''')

    # Таблица api_event_related_events (Связь между событиями и мероприятиями)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_event_related_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id BIGINT NOT NULL,
            activity_id BIGINT NOT NULL,
            FOREIGN KEY (event_id) REFERENCES api_event(id),
            FOREIGN KEY (activity_id) REFERENCES api_activity(id)
        )
    ''')

    # Таблица api_event_participants (Связь между событиями и участниками)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_event_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id BIGINT NOT NULL,
            person_id BIGINT NOT NULL,
            FOREIGN KEY (event_id) REFERENCES api_event(id),
            FOREIGN KEY (person_id) REFERENCES api_person(id)
        )
    ''')

    # Таблица api_activity_related_activities (Связь между мероприятиями и событиями)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_activity_related_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id BIGINT NOT NULL,
            event_id BIGINT NOT NULL,
            FOREIGN KEY (activity_id) REFERENCES api_activity(id),
            FOREIGN KEY (event_id) REFERENCES api_event(id)
        )
    ''')

    # Таблица api_activity_items (Связь между мероприятиями и предметами)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_activity_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id BIGINT NOT NULL,
            item_id BIGINT NOT NULL,
            FOREIGN KEY (activity_id) REFERENCES api_activity(id),
            FOREIGN KEY (item_id) REFERENCES api_item(id)
        )
    ''')

    print("Таблицы успешно созданы.")

# Вызываем функцию для создания таблиц
create_tables()

# Сохраняем изменения и закрываем соединение
conn.commit()
conn.close()
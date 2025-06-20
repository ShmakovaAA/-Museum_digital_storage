import os
import shutil
import subprocess
import sys
import threading
import time
from django.core.management import call_command
from django.core.wsgi import get_wsgi_application

project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_dir)

# =======================================================
# run cmd
def run_command(command, cwd=None):
    try:
        print(f"Выполняем команду: {' '.join(command)}")
        result = subprocess.run(command, cwd=cwd, check=True, text=True, capture_output=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("Ошибка при выполнении команды:")
        print(e.stderr)
        sys.exit(1)

# =======================================================
# remove old.database       
def remove_database_file(project_dir):
    db_path = os.path.join(project_dir, "db.sqlite3")
    if os.path.exists(db_path):
        print(f"Удаляем файл базы данных: {db_path}")
        try:
            os.remove(db_path)
        except Exception as e:
            print(f"Не удалось удалить файл базы данных. Причина: {e}")
    else:
        print("Файл базы данных db.sqlite3 не найден.")

# =======================================================
# remove migrations    
def remove_migrations_folder(project_dir):
    migrations_path = os.path.join(project_dir, "api", "migrations")
    if os.path.exists(migrations_path):
        print(f"Удаляем папку миграций: {migrations_path}")
        shutil.rmtree(migrations_path)
    else:
        print("Папка миграций не найдена.")

# =======================================================
# clear mediafiles    
def clear_mediafiles_folder(project_dir):
    mediafiles_path = os.path.join(project_dir, "mediafiles")
    if os.path.exists(mediafiles_path):
        print(f"Очищаем содержимое папки: {mediafiles_path}")
        for filename in os.listdir(mediafiles_path):
            file_path = os.path.join(mediafiles_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Не удалось удалить {file_path}. Причина: {e}")
    else:
        print("Папка mediafiles не найдена.")

# =======================================================
# preliminarily run django         
def start_and_stop_server(project_dir):
    print("Запускаем сервер...")
    
    # Добавляем корневую директорию проекта в PYTHONPATH
    sys.path.append(project_dir)

    # Устанавливаем переменные окружения Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mtlapi.settings')

    # Команда для запуска сервера
    command = [sys.executable, "manage.py", "runserver", "--noreload"]

    try:
        # Запускаем сервер как подпроцесс
        server_process = subprocess.Popen(
            command,
            cwd=project_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Ждём несколько секунд, чтобы убедиться, что сервер запущен
        time.sleep(2)

        # Проверяем, что сервер работает
        if server_process.poll() is not None:
            print("Сервер не запустился. Проверьте логи.")
            print(server_process.stderr.read())
            return

        print("Сервер успешно запущен.")

    except Exception as e:
        print(f"Ошибка при запуске сервера: {e}")
        return

    # Останавливаем сервер
    print("Останавливаем сервер...")
    server_process.terminate()

    # Ждём завершения процесса
    try:
        server_process.wait(timeout=5)  # Даем процессу 5 секунд на завершение
        print("Сервер успешно остановлен.")
    except subprocess.TimeoutExpired:
        print("Таймаут при остановке сервера. Принудительно завершаем процесс.")
        server_process.kill()

# =======================================================
# create new.database              
def run_create_script(project_dir):
    print("Создаем новую базу средствами SQLITE...")
    create_script_path = os.path.join(project_dir, "sql", "create.py")
    
    if not os.path.exists(create_script_path):
        print(f"Файл {create_script_path} не найден.")
        return

    command = [sys.executable, create_script_path]

    run_command(command, cwd=project_dir)

# =======================================================
# create superuser
def create_superuser(project_dir):
    print("Создаем суперпользователя...")
    command = [
        sys.executable,
        "manage.py",
        "createsuperuser",
        "--noinput",
        "--username=admin",
        "--email=admin@admin.admin"
    ]

    os.environ["DJANGO_SUPERUSER_PASSWORD"] = "admin"

    try:
        run_command(command, cwd=project_dir)
        print("Суперпользователь успешно создан.")
    except Exception as e:
        print(f"Ошибка при создании суперпользователя: {e}")
        
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#                       MAIN SCRIPT
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
def main():
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Шаг 1. Удаление старой базы
    remove_database_file(project_dir)
    
    # Шаг 2. Очистка migrations
    remove_migrations_folder(project_dir)
    
    # Шаг 3. Очистка mediafiles
    clear_mediafiles_folder(project_dir)
    
    # Шаг 4. Первичный запуск Django
    start_and_stop_server(project_dir)
    
    # Шаг 5. Миграция Django
    print("Выполняем миграции Django...")
    migrate_command = [sys.executable, "manage.py", "migrate"]
    run_command(migrate_command, cwd=project_dir)
    
      # Шаг 8. Создание суперпользователя
    create_superuser(project_dir)
    run_command(migrate_command, cwd=project_dir)
    
    # Шаг 6. Создание новой БД SQLITE
    run_create_script(project_dir)
    
    # Шаг 7. Миграция новой БД SQLITE в Django
    print("Выполняем миграции Django...")
    makemigrations_command = [sys.executable, "manage.py", "makemigrations", "api"]
    run_command(makemigrations_command, cwd=project_dir)
    
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if __name__ == "__main__":
    main()
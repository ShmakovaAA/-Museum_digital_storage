import subprocess

files_to_run = [
    "test_persons.py",
    "test_activities.py",
    "test_items.py",
    "test_events.py"
]

def run_script(script_name):
    print(f"Запуск скрипта: {script_name}")
    try:
        result = subprocess.run(["python", script_name], check=True)
        if result.returncode == 0:
            print(f"Скрипт {script_name} выполнен успешно.")
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при выполнении скрипта {script_name}: {e}")

def main():
    print("Начинаем выполнение всех тестовых скриптов...")
    
    for file in files_to_run:
        run_script(file)
    
    print("Все тестовые скрипты выполнены.")

if __name__ == "__main__":
    main()
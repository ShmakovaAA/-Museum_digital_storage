// TestGenerateEvents.jsx

// =====================================
// ФУНКЦИЯ ГЕНЕРАЦИИ СЛУЧАЙНЫХ СОБЫТИЙ
// =====================================

export function generateRandomEvents(startYear, endYear) {
    const events = {};
    let globalId = 1; // Глобальный счётчик ID

    // Цикл по каждому году в указанном диапазоне
    for (let year = startYear; year <= endYear; year++) {
        const eventCount = Math.floor(Math.random() * 10) + 1; // От 1 до 10 событий
        const yearEvents = [];

        // Генерация событий для текущего года
        for (let i = 0; i < eventCount; i++) {
            const isRange = Math.random() < 0.5; // Случайный выбор: одинарная дата или диапазон
            const startDate = getRandomDate(year); // Генерация начальной даты
            const endDate = isRange ? getRandomDateInRange(startDate, year) : null; // Генерация конечной даты, если это диапазон

            const date = isRange ? `${startDate} ${endDate}` : startDate; // Формируем дату (одинарная или диапазон)
            const title = `${getRandomText()} ${getRandomText()} ${year}`; // Генерация названия события
            const description = `Подробное описание события: ${getRandomText(
                10
            )} ${getRandomText(10)}.`; // Генерация описания события

            // Добавление события в массив событий для текущего года
            yearEvents.push({
                id: globalId++, // Добавляем уникальный ID и увеличиваем счётчик
                date,
                title,
                description,
            });
        }

        // Добавление массива событий для текущего года в объект событий
        events[year] = yearEvents;
    }

    return events;
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

// Функция для генерации случайной даты в пределах года
function getRandomDate(year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const randomTimestamp =
        startOfYear.getTime() +
        Math.random() * (endOfYear.getTime() - startOfYear.getTime());
    const randomDate = new Date(randomTimestamp);

    // Форматируем дату в формат YYYY-MM-DD
    const formattedDate = randomDate.toISOString().split("T")[0];
    return formattedDate;
}

// Функция для генерации случайной даты в диапазоне после заданной даты
function getRandomDateInRange(startDate, year) {
    const start = new Date(startDate); // Преобразуем строку даты в объект Date
    const endOfYear = new Date(year, 11, 31); // Последний день года

    const randomTimestamp =
        start.getTime() +
        Math.random() * (endOfYear.getTime() - start.getTime());
    const randomDate = new Date(randomTimestamp);

    // Форматируем дату в формат YYYY-MM-DD
    const formattedDate = randomDate.toISOString().split("T")[0];
    return formattedDate;
}

// Функция для генерации случайного текста
function getRandomText(length = 5) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < length; i++) {
        text += chars[Math.floor(Math.random() * chars.length)];
    }
    return text.charAt(0).toUpperCase() + text.slice(1); // Первый символ заглавный
}
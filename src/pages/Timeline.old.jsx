import React, { useEffect, useState } from "react";

const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

// ================================
// ФУНКЦИЯ ГЕНЕРАЦИИ СЛУЧАЙНЫХ СОБЫТИЙ
// ================================

// Функция для генерации случайной даты в пределах года
function getRandomDate(year) {
  const startOfYear = new Date(year, 0, 1); // 1 января текущего года
  const endOfYear = new Date(year, 11, 31); // 31 декабря текущего года
  const randomTimestamp =
    startOfYear.getTime() +
    Math.random() * (endOfYear.getTime() - startOfYear.getTime());
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

// Функция для генерации случайных событий
function generateRandomEvents(startYear, endYear) {
  const events = {};

  for (let year = startYear; year <= endYear; year++) {
    const eventCount = Math.floor(Math.random() * 10) + 1; // От 1 до 10 событий
    const yearEvents = [];

    for (let i = 0; i < eventCount; i++) {
      const date = getRandomDate(year);
      const title = `${getRandomText()} ${getRandomText()} ${year}`;
      const description = `Подробное описание события: ${getRandomText(
        10
      )} ${getRandomText(10)}.`;

      yearEvents.push({ date, title, description });
    }

    events[year] = yearEvents;
  }
  return events;
}

// ================================
// КОМПОНЕНТ TIMELINE
// ================================

const Timeline = () => {
  const [currentYear, setCurrentYear] = useState(2023);
  const [translateX, setTranslateX] = useState(0);
  const [eventsData, setEventsData] = useState({});

  // Генерация случайных событий при монтировании компонента
  useEffect(() => {
    const randomEvents = generateRandomEvents(1900, 2025);
    setEventsData(randomEvents);
  }, []);

  // Вычисляем максимальное значение translateX для ограничения скролла
  const getMaxTranslateX = () => {
    const yearSelectorContainer = document.querySelector(".year-selector-container");
    if (!yearSelectorContainer) return 0;

    const containerWidth = yearSelectorContainer.scrollWidth;
    const viewportWidth = window.innerWidth;

    return Math.max(0, containerWidth - viewportWidth);
  };

  const generateYears = () => {
    return Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i).map((year) => {
      const eventCount = eventsData[year]?.length || 0; // Получаем количество событий для года

      return (
        <span
          key={year}
          className={`year ${year === currentYear ? "active" : ""}`}
          onClick={() => setCurrentYear(year)}
        >
          <div className="year-label">{year}</div>
          <div className="event-count">{eventCount}</div>
        </span>
      );
    });
  };

  const generateMonths = () => {
    return months.map((month, index) => (
      <div key={index} className="timeline-month-column">
        <span className="month-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="month-name">{month}</span>
      </div>
    ));
  };

  const generateEvents = () => {
    const eventsForYear = eventsData[currentYear] || [];
    const eventsByMonth = {};

    // Группируем события по месяцам
    eventsForYear.forEach((event) => {
      const monthIndex = new Date(event.date).getMonth();
      if (!eventsByMonth[monthIndex]) {
        eventsByMonth[monthIndex] = [];
      }
      eventsByMonth[monthIndex].push(event);
    });

    return months.map((month, index) => {
      const eventsInMonth = eventsByMonth[index] || [];

      return (
        <div key={index} className="timeline-month-column">
          {eventsInMonth.map((event, eventIndex) => (
            <div key={eventIndex} className="timeline-event">
              <span className="date">{event.date}</span>
              <span className="title">{event.title}</span>
              <span className="description">{event.description}</span>
            </div>
          ))}
        </div>
      );
    });
  };

  const handleScroll = (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение прокрутки
    const delta = e.deltaY;
    const maxTranslateX = getMaxTranslateX();

    setTranslateX((prev) => {
      let newTranslateX = prev + (delta > 0 ? -100 : 100);
      newTranslateX = Math.min(0, Math.max(-maxTranslateX, newTranslateX)); // Ограничиваем диапазон
      return newTranslateX;
    });
  };

  useEffect(() => {
    const yearSelector = document.getElementById("year-selector");
    yearSelector.addEventListener("wheel", handleScroll);

    return () => yearSelector.removeEventListener("wheel", handleScroll);
  }, []);

  return (
    <div className="timeline-container">
      <div className="year-selector" id="year-selector">
        <div className="year-selector-container" style={{ transform: `translateX(${translateX}px)` }}>
          {generateYears()}
        </div>
      </div>

      <div className="timeline">
        <div className="timeline-months">{generateMonths()}</div>
        <div className="timeline-events">{generateEvents()}</div>
      </div>
    </div>
  );
};

export default Timeline;
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// =====================================
// Timeline
// =====================================
const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const Timeline = () => {
    const years = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i);
    
    const [scrollPosition, setScrollPosition] = useState(0);
    const [eventsPerYear, setEventsPerYear] = useState({});
    const [selectedYear, setSelectedYear] = useState(null);
    const [yearEvents, setYearEvents] = useState([]);
    const containerRef = useRef(null);
    
    const CELL_WIDTH = 140;
    const PADDING = 50;
    const SCROLL_SPEED = 4;

    //======================================
    // ФИЛЬТРАЦИЯ
    //======================================

    // Состояния для фильтров
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [filterValue, setFilterValue] = useState(null);
    const [locations, setLocations] = useState([]);
    const [persons, setPersons] = useState([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Текст поиска
    const [sortBy, setSortBy] = useState(null); // Тип сортировки: "date" или "events"

    const navigate = useNavigate();
    
    const [filters, setFilters] = useState({
        filter_date: null,
        filter_location: null,
        filter_person: null,
    });

    document.title = "Лента времени - Таймлайн"

    //======================================
    // Проверка на включенные фильтры
    const hasActiveFilters = () => {
        return (
            filters.filter_date !== null ||
            filters.filter_location !== null ||
            filters.filter_person !== null ||
            sortBy !== null
        );
    };

    // Эффект для закрытия меню при клике за его границами
    useEffect(() => {
        const handleClickOutside = (event) => {
            const filtersMenu = document.querySelector(".filters-menu");
            const filtersButton = document.querySelector(".filters-button");

            // Если клик был за пределами меню и кнопки фильтров
            if (
                filtersMenu &&
                !filtersMenu.contains(event.target) &&
                !filtersButton.contains(event.target)
            ) {
                setFiltersOpen(false); // Закрываем меню
            }
        };

        // Добавляем обработчик клика на документ
        document.addEventListener("click", handleClickOutside);

        // Удаляем обработчик при размонтировании компонента
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    //======================================
    // Филтрация по дате
    const handleDateFilterClick = () => {
        const isDateFilterActive = sortBy === "date";
    
        // Переключаем состояние сортировки
        setSortBy(isDateFilterActive ? null : "date");
    
        // Обновляем фильтры
        const updatedFilters = {
            ...filters,
            filter_date: isDateFilterActive ? null : 'True',
        };
        setFilters(updatedFilters);
    };
    
    //======================================
    // Фильтрация по количеству
    const handleEventsFilterClick = () => {
        const isEventsFilterActive = sortBy === "events";
    
        // Переключаем состояние сортировки
        setSortBy(isEventsFilterActive ? null : "events");
    };

    //======================================
    // Фильтрация по Локации
    const handleLocationFilter = (locationName) => {
        const isLocationFilterActive = filters.filter_location === locationName;

        // Обновляем состояние фильтров
        const updatedFilters = {
            ...filters,
            filter_location: isLocationFilterActive ? null : locationName,
        };
        setFilters(updatedFilters);
    };

    //======================================
    // Фильтрация по Персонам
    const handlePersonFilter = (personName) => {
        const isPersonFilterActive = filters.filter_person === personName;

        // Обновляем состояние фильтров
        const updatedFilters = {
            ...filters,
            filter_person: isPersonFilterActive ? null : personName,
        };
        setFilters(updatedFilters);
    };

    //======================================
    // ОБНОВЛЕНИЕ КОЛИЧЕСТВА СОБЫТИЙ НА ГОД
    //======================================
    
    // Очистка пустых ячеек
    const getYearsWithEvents = () => {
        return years.filter(year => eventsPerYear[year] > 0);
    };

    const getSortedYears = () => {
        const yearsWithEvents = years.filter(year => eventsPerYear[year] > 0); // Оставляем только года с событиями
    
        if (sortBy === "date") {
            // Сортировка по дате (от меньшего к большему)
            return yearsWithEvents.sort((a, b) => a - b);
        }
    
        if (sortBy === "events") {
            // Сортировка по количеству событий (от меньшего к большему)
            return yearsWithEvents.sort((a, b) => eventsPerYear[a] - eventsPerYear[b]);
        }
    
        // Если сортировка не активна, возвращаем года в исходном порядке
        return yearsWithEvents;
    };

    useEffect(() => {
        const fetchEventsPerYear = async () => {
            try {
                // Формируем параметры фильтрации на основе состояния filters
                const params = new URLSearchParams();
                if (filters.filter_date === 'True') {
                    params.set('filter_date', 'True');
                }
                if (filters.filter_location) {
                    params.set('filter_location', filters.filter_location);
                }
                if (filters.filter_person) {
                    params.set('filter_person', filters.filter_person);
                }
        
                // Формируем полный URL с параметрами фильтрации
                const url = `http://127.0.0.1:8000/api/event/events-per-year/${params.toString() ? `?${params.toString()}` : ''}`;
        
                // Выполняем запрос к API
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to fetch events per year");
                }
                const data = await response.json();
        
                // Сохраняем данные о количестве событий в каждом году
                setEventsPerYear(data);
        
                // Прокручиваем контейнер к концу после рендера
                setTimeout(() => {
                    if (containerRef.current) {
                        containerRef.current.scrollTo({
                            left: containerRef.current.scrollWidth,
                            behavior: "smooth",
                        });
                    }
                }, 0);
            } catch (error) {
                console.error("Error fetching events per year:", error);
            }
        };

        // Загружаем все события для сбора локаций и личностей
        const fetchAllEvents = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/event/");
                if (!response.ok) {
                    throw new Error("Failed to fetch all events");
                }
                const data = await response.json();
    
                // Собираем уникальные локации и подсчитываем их количество
                const allLocations = data.map(event => event.location).filter(loc => loc !== null);
                const locationCounts = allLocations.reduce((acc, location) => {
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                }, {});
                const formattedLocations = Object.entries(locationCounts).map(([name, count]) => ({
                    name,
                    count,
                }));
    
                // Собираем уникальные личности и подсчитываем их количество
                const allPersons = data.flatMap(event =>
                    event.participants.map(participant => participant.full_name)
                );
                const personCounts = allPersons.reduce((acc, person) => {
                    acc[person] = (acc[person] || 0) + 1;
                    return acc;
                }, {});
                const formattedPersons = Object.entries(personCounts).map(([name, count]) => ({
                    name,
                    count,
                }));
                
                setLocations(formattedLocations);
                setPersons(formattedPersons);
            } catch (error) {
                console.error("Error fetching all events:", error);
            }
        };
        fetchEventsPerYear();
        fetchAllEvents();
    }, [filters]);
    
    // Модальник
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Функция для открытия модального окна с выбранным фильтром
    const openModal = (filterType) => {
        setSelectedFilter(filterType);
        setFilterValue(null);
        setIsModalOpen(true); // Открываем модальное окно
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFilter(null); // Сбрасываем выбранный фильтр
        setSearchQuery(""); // Очищаем строку поиска
    };

    // Функция для загрузки событий за конкретный год
    const fetchEventsForYear = async (year) => {
        if (!year) {
            console.warn("Year is null or undefined. Skipping fetch.");
            return;
        }

        try {
            // Формируем параметры фильтрации на основе состояния filters
            const params = new URLSearchParams();
            if (filters.filter_date === 'True') {
                params.set('filter_date', 'True');
            }
            if (filters.filter_location) {
                params.set('filter_location', filters.filter_location);
            }
            if (filters.filter_person) {
                params.set('filter_person', filters.filter_person);
            }

            // Формируем полный URL с параметрами фильтрации
            const url = `http://127.0.0.1:8000/api/event/year/${year}/${params.toString() ? `?${params.toString()}` : ''}`;

            // Выполняем запрос к API
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch events for year ${year}`);
            }
            const data = await response.json();

            // Сохраняем события в состояние
            setYearEvents(data);
        } catch (error) {
            console.error(`Error fetching events for year ${year}:`, error);
        }
    };

    const filteredItems = (items) => {
        return items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Логика скролла влево/вправо
    const scrollBy = (offset) => {
        if (containerRef.current) {
            const newScrollPosition = containerRef.current.scrollLeft + offset;
            const roundedPosition = Math.round(newScrollPosition / CELL_WIDTH) * CELL_WIDTH;
            containerRef.current.scrollTo({
                left: roundedPosition,
                behavior: "smooth",
            });
        }
    };

    // Логика скролла к началу/концу
    const scrollToEdge = (isStart) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                left: isStart ? 0 : containerRef.current.scrollWidth,
                behavior: "smooth",
            });
        }
    };

    // Обновление состояния кнопок при скролле
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setScrollPosition(containerRef.current.scrollLeft);
            }
        };
        const container = containerRef.current;
        container?.addEventListener("scroll", handleScroll);
        return () => container?.removeEventListener("scroll", handleScroll);
    }, []);

    // Обработка скролла колесиком мыши
    const handleWheel = (event) => {
        const delta = event.deltaY;
        if (delta > 0) {
            scrollBy(CELL_WIDTH * SCROLL_SPEED);
        } else if (delta < 0) {
            scrollBy(-CELL_WIDTH * SCROLL_SPEED);
        }
    };

    // Функция для выбора года
    const handleYearClick = (year) => {
        setSelectedYear((prevYear) => {
            if (prevYear === year) {
                setYearEvents([]); // Очищаем события при повторном клике
                return null;
            }
            if (year) {
                fetchEventsForYear(year); // Загружаем события для нового года
            }
            return year;
        });
    };

    // Функция для получения событий по месяцам для выбранного года
    const getEventsForMonth = (monthIndex) => {
        if (!selectedYear || yearEvents.length === 0) return [];
        const monthNumber = String(monthIndex + 1).padStart(2, "0");
        return yearEvents.filter((event) => {
            const eventMonth = event.start_date.split("-")[1];
            return eventMonth === monthNumber;
        });
    };


    // Функция для сброса фильтров
    const resetFilters = () => {
        window.location.reload();
    };

    // Обработчик клика на событие
    const handleEventClick = (eventId) => {
        navigate(`/event/${eventId}`); // Переход на страницу события
    };

    return (
        <div className="timeline_container">
            {/* Контейнер с годами */}
            <div className="years-container">
                {/* Левые кнопки */}
                <div className="controls left-controls">
                    <button
                        className="scroll-to-start"
                        onClick={() => scrollToEdge(true)}
                        disabled={scrollPosition === 0}
                    >
                        {"◀"}
                    </button>
                    <button
                        className="scroll-left"
                        onClick={() => scrollBy(-CELL_WIDTH)}
                        disabled={scrollPosition === 0}
                    >
                        {"❮"}
                    </button>
                </div>
                {/* Блок с годами */}
                <div
                    className="years-wrapper"
                    ref={containerRef}
                    onWheel={handleWheel}
                >
                    <div className="years">
                        {getSortedYears().map((year) => (
                            <div
                                className={`year-cell ${selectedYear === year ? "active" : ""}`}
                                key={year}
                                onClick={() => handleYearClick(year)}
                            >
                                <div className="year">{year}</div>
                                <div className="event-count">
                                    {eventsPerYear[year] || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Правые кнопки */}
                <div className="controls right-controls">
                    <button
                        className="scroll-right"
                        onClick={() => scrollBy(CELL_WIDTH)}
                        disabled={
                            containerRef.current &&
                            scrollPosition >=
                                containerRef.current.scrollWidth -
                                containerRef.current.clientWidth
                        }
                    >
                        {"❯"}
                    </button>
                    <button
                        className="scroll-to-end"
                        onClick={() => scrollToEdge(false)}
                        disabled={
                            containerRef.current &&
                            scrollPosition >=
                                containerRef.current.scrollWidth -
                                containerRef.current.clientWidth
                        }
                    >
                        {"▶"}
                    </button>
                </div>
            </div>

            {/* Фильтры */}
            <div className="filters_timeline">
                <div className="filters-container">
                    <button className="filters-button" onClick={() => setFiltersOpen(!filtersOpen)}>
                        Фильтры
                        <span className={`caret ${filtersOpen ? "open" : ""}`}>▼</span>
                    </button>
                    {filtersOpen && (
                        <div className="filters-menu">
                            <button
                                className={`filter-option ${sortBy === "date" ? "active" : ""}`}
                                onClick={handleDateFilterClick}
                            >
                                По дате
                            </button>
                            <button
                                className={`filter-option ${sortBy === "events" ? "active" : ""}`}
                                onClick={handleEventsFilterClick}
                            >
                                По кол-ву
                            </button>
                            <button
                                className={`filter-option ${filters.filter_location ? "active" : ""}`}
                                onClick={() => openModal("location")}
                            >
                                По локации
                            </button>
                            <button
                                className={`filter-option ${filters.filter_person ? "active" : ""}`}
                                onClick={() => openModal("person")}
                            >
                                По личности
                            </button>
                        </div>
                    )}
                </div>

                {/* Модальное окно */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={closeModal}>
                            ×
                            </button>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-values">
                                {selectedFilter === "location" &&
                                    (filteredItems(locations).length > 0 ? (
                                        filteredItems(locations).map(({ name, count }) => (
                                            <button
                                                key={name}
                                                className="filter-value"
                                                onClick={() => handleLocationFilter(name)}
                                            >
                                                {name} ({count})
                                            </button>
                                        ))
                                    ) : (
                                        <p>Нет совпадений</p>
                                    ))}
                                {selectedFilter === "person" &&
                                    (filteredItems(persons).length > 0 ? (
                                        filteredItems(persons).map(({ name, count }) => (
                                            <button
                                                key={name}
                                                className="filter-value"
                                                onClick={() => handlePersonFilter(name)} 
                                            >
                                                {name} ({count})
                                            </button>
                                        ))
                                    ) : (
                                        <p>Нет совпадений</p>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Кнопка сброса фильтров */}
                <button
                    className={`reset-filters ${hasActiveFilters() ? "" : "disabled"}`}
                    onClick={resetFilters}
                    disabled={!hasActiveFilters()} // Отключаем кнопку, если фильтры не выбраны
                >
                    Сбросить фильтры
                </button>
            </div>

            {/* Контейнер с месяцами */}
            <div className="months_container">
                {months.map((month, index) => {
                    const monthNumber = String(index + 1).padStart(2, "0");
                    const events = getEventsForMonth(index);
                    return (
                        <div className="month" key={index}>
                            <div className="month_title">
                                <span className="month_title_num">{monthNumber}</span>
                                <span className="month_title_str">{month.toUpperCase()}</span>
                            </div>
                            <div className="month_content">
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <div
                                            className="event"
                                            key={event.id}
                                            onClick={() => handleEventClick(event.id)}
                                        >
                                            <span className="event_date" id={event.id}>
                                                {event.start_date}
                                            </span>
                                            <span className="event_title">{event.title}</span>
                                            <span className="event_description">
                                                {event.description}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-events"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Timeline;
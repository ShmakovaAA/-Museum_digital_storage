import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Activity = () => {
    const { id } = useParams(); // Получаем ID мероприятия из URL
    const [activityData, setActivityData] = useState(null); // Состояние для хранения данных мероприятия
    const [previewPhoto, setPreviewPhoto] = useState(null); // Состояние для хранения данных о превью фото
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки
    const navigate = useNavigate(); // Для навигации

    // Состояния для активного изображения и видео
    const [activeImage, setActiveImage] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [videoPreviews, setVideoPreviews] = useState({}); // Храним превью для видео

    // Загрузка данных о мероприятии
    useEffect(() => {
        const fetchActivityDetails = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/activity/${id}/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch activity details");
                }
                const data = await response.json();
                setActivityData(data); // Сохраняем данные в состояние

                document.title = "Лента времени - Мероприятие"

                // Если есть preview_photo, загружаем данные о медиафайле
                if (data.preview_photo) {
                    const mediaResponse = await fetch(
                        `http://127.0.0.1:8000/api/mediafile/${data.preview_photo}/`
                    );
                    if (mediaResponse.ok) {
                        const mediaData = await mediaResponse.json();
                        if (mediaData.mediafile_type === "photo" && mediaData.file_path) {
                            setPreviewPhoto(mediaData.file_path);
                        }
                    }
                }

                // Инициализация активного изображения (первое изображение в mediafiles)
                if (data.mediafiles && data.mediafiles.length > 0) {
                    const firstImage = data.mediafiles.find((media) => media.mediafile_type === "photo");
                    setActiveImage(firstImage || null);

                    // Инициализация активного видео (первое видео в mediafiles)
                    const firstVideo = data.mediafiles.find((media) => media.mediafile_type === "video");
                    setActiveVideo(firstVideo || null);

                    // Генерация превью для видео
                    generateVideoPreviews(data.mediafiles.filter((media) => media.mediafile_type === "video"));
                }

                setLoading(false); // Загрузка завершена
            } catch (error) {
                console.error("Error fetching activity details:", error);
                setError("Failed to load activity details.");
                setLoading(false); // Загрузка завершена с ошибкой
            }
        };

        fetchActivityDetails();
    }, [id]);

    // Функция для переключения на предыдущее изображение
    const handlePrevImage = () => {
        if (!activityData || !activityData.mediafiles) return;
        const photos = activityData.mediafiles.filter((media) => media.mediafile_type === "photo");
        const currentIndex = photos.findIndex(
            (mediafile) => mediafile.mediafile_id === activeImage.mediafile_id
        );
        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        setActiveImage(photos[prevIndex]);
    };

    // Функция для переключения на следующее изображение
    const handleNextImage = () => {
        if (!activityData || !activityData.mediafiles) return;
        const photos = activityData.mediafiles.filter((media) => media.mediafile_type === "photo");
        const currentIndex = photos.findIndex(
            (mediafile) => mediafile.mediafile_id === activeImage.mediafile_id
        );
        const nextIndex = (currentIndex + 1) % photos.length;
        setActiveImage(photos[nextIndex]);
    };

    // Функция для переключения на предыдущее видео
    const handlePrevVideo = () => {
        if (!activityData || !activityData.mediafiles) return;
        const videos = activityData.mediafiles.filter((media) => media.mediafile_type === "video");
        const currentIndex = videos.findIndex(
            (mediafile) => mediafile.mediafile_id === activeVideo.mediafile_id
        );
        const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
        setActiveVideo(videos[prevIndex]);
    };

    // Функция для переключения на следующее видео
    const handleNextVideo = () => {
        if (!activityData || !activityData.mediafiles) return;
        const videos = activityData.mediafiles.filter((media) => media.mediafile_type === "video");
        const currentIndex = videos.findIndex(
            (mediafile) => mediafile.mediafile_id === activeVideo.mediafile_id
        );
        const nextIndex = (currentIndex + 1) % videos.length;
        setActiveVideo(videos[nextIndex]);
    };

    // Генерация превью для видео
    const generateVideoPreviews = async (videos) => {
        const previews = {};
        for (const video of videos) {
            const previewUrl = await captureVideoFrame(video.file_path);
            previews[video.mediafile_id] = previewUrl;
        }
        setVideoPreviews(previews);
    };

    // Функция для захвата первого кадра видео
    const captureVideoFrame = (videoUrl) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            const canvas = document.createElement("canvas");
            video.src = videoUrl;
            video.crossOrigin = "anonymous"; // Для CORS
            video.muted = true;
            video.preload = "auto";
            video.onloadedmetadata = () => {
                video.currentTime = 1; // Берем первый кадр
            };
            video.onseeked = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const previewUrl = canvas.toDataURL("image/jpeg");
                resolve(previewUrl);
            };
        });
    };

    // Если данные еще загружаются
    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Если произошла ошибка
    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>Назад</button>
            </div>
        );
    }

    return (
        <div className="event-details-container">
            {/* Объединенный блок: фото + информация о мероприятии */}
            <div className="header-block-container">
                {/* Превью фото */}
                {previewPhoto && (
                    <div className="photo-container">
                        <img src={previewPhoto} alt="Activity Preview" />
                    </div>
                )}
                {/* Информация о мероприятии */}
                <div className="event-info-container">
                    <h1 className="event-title">{activityData.title}</h1>
                    <div className="event-meta">
                        {/* Тип мероприятия */}
                        {activityData.event_type_display && (
                            <p className="event-type">
                                <span className="event-type-badge">{activityData.event_type_display.toUpperCase()}</span>
                            </p>
                        )}
                        {/* Даты */}
                        <p className="event-date">
                        📅 Дата начала: <b>{activityData.start_date}</b>
                            {activityData.end_date && ` | Дата завершения: ${activityData.end_date}`}
                        </p>
                        {/* Локация */}
                        <p className="event-location">🌍 Локация: <b>{activityData.location}</b></p>
                    </div>
                </div>
            </div>

            {/* Описание мероприятия */}
            <div className="block-container">
                <p className="event-description">{activityData.description}</p>
            </div>

            {/* Предметы (только для выставок) */}
            {activityData.event_type === "exhibition" && activityData.items && (
                <div className="block-container items-block">
                    <h3>📚 Предметы:</h3>
                    {activityData.items.length > 0 ? (
                        <ul>
                            {activityData.items.map((item) => (
                                <li key={item.id} className="item-item">
                                    {/* Эмодзи + название предмета */}
                                    <span className="item-name">{item.name}</span>
                                    {/* Описание предмета */}
                                    <p className="item-description">{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No items available.</p>
                    )}
                </div>
            )}

            {/* Связанные события */}
            <div className="block-container related-events">
                <h3>🔗 Связанные события:</h3>
                {activityData.related_activities && activityData.related_activities.length > 0 ? (
                    <ul>
                        {activityData.related_activities.map((event) => (
                            <li
                                key={event.id}
                                className="related-event-item"
                                onClick={() => navigate(`/event/${event.id}`)} // Переход на страницу события
                            >
                                {/* Информация о событии */}
                                <span className="event-info">
                                    {event.title} ({event.start_date}
                                    {event.end_date && ` - ${event.end_date}`})
                                </span>
                                {/* Всплывающее окно с описанием */}
                                <div className="event-tooltip">{event.description}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No related events.</p>
                )}
            </div>
            
            {/* Ссылки */}
            <div className="block-container links">
                <h3>🔗 Ссылки:</h3>
                {activityData.links.length > 0 ? (
                    <ul>
                        {activityData.links.map((link, index) => (
                            <li key={index} className="link-item">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No links available.</p>
                )}
            </div>

            {/* Галерея изображений */}
            {activityData.mediafiles && activityData.mediafiles.some((media) => media.mediafile_type === "photo") && (
                <div className="block-container gallery-block">
                    <h3>Галерея</h3>
                    <div className="gallery-container">
                        {/* Большое активное изображение с кнопками переключения */}
                        <div className="image-navigation">
                            <button className="gallery-arrow left-arrow" onClick={handlePrevImage}>
                                ←
                            </button>
                            <img
                                src={activeImage?.file_path}
                                alt="Active Gallery Image"
                                className="active-image"
                            />
                            <button className="gallery-arrow right-arrow" onClick={handleNextImage}>
                                →
                            </button>
                        </div>
                        {/* Миниатюры изображений */}
                        <div className="thumbnails-container">
                            {activityData.mediafiles
                                .filter((media) => media.mediafile_type === "photo")
                                .map((mediafile, index) => (
                                    <img
                                        key={mediafile.mediafile_id}
                                        src={mediafile.file_path}
                                        alt={`Thumbnail ${index}`}
                                        className={`thumbnail ${
                                            activeImage?.mediafile_id === mediafile.mediafile_id
                                                ? "active-thumbnail"
                                                : ""
                                        }`}
                                        onClick={() => setActiveImage(mediafile)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Видео блок */}
            {activityData.mediafiles && activityData.mediafiles.some((media) => media.mediafile_type === "video") && (
                <div className="block-container video-block">
                    <h3>Видеоплеер</h3>
                    <div className="video-container">
                        {/* Активное видео с кнопками переключения */}
                        <div className="video-navigation">
                            <button className="video-arrow left-arrow" onClick={handlePrevVideo}>
                                ←
                            </button>
                            <video src={activeVideo?.file_path} controls className="active-video" />
                            <button className="video-arrow right-arrow" onClick={handleNextVideo}>
                                →
                            </button>
                        </div>
                        {/* Миниатюры видео */}
                        <div className="thumbnails-container">
                            {activityData.mediafiles
                                .filter((media) => media.mediafile_type === "video")
                                .map((mediafile, index) => (
                                    <img
                                        key={mediafile.mediafile_id}
                                        src={videoPreviews[mediafile.mediafile_id] || ""}
                                        alt={`Video Thumbnail ${index}`}
                                        className={`thumbnail ${
                                            activeVideo?.mediafile_id === mediafile.mediafile_id
                                                ? "active-thumbnail"
                                                : ""
                                        }`}
                                        onClick={() => setActiveVideo(mediafile)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Блок документов */}
            {activityData.mediafiles && activityData.mediafiles.some((media) => media.mediafile_type === "document") && (
                <div className="block-container documents-block">
                    <h3>Документы</h3>
                    <div className="documents-container">
                        {activityData.mediafiles
                            .filter((media) => media.mediafile_type === "document")
                            .map((document, index) => (
                                <div key={document.mediafile_id} className="document-item">
                                    {/* Иконка документа */}
                                    <span className="document-icon">📋</span>
                                    {/* Название документа */}
                                    <span className="document-name">
                                        {document.file_name || document.file_path.split("/").pop()}
                                    </span>
                                    {/* Кнопка скачать */}
                                    <button
                                        className="download-button"
                                        onClick={() => window.open(document.file_path, "_blank")}
                                    >
                                        Скачать
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            

            {/* Кнопка "Назад" */}
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Назад
                </button>
            </div>
        </div>
    );
};

export default Activity;
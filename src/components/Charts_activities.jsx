import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2"; // Используем Pie для круговых диаграмм
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Необходим для круговых диаграмм
} from "chart.js";
import axios from "axios";

// Регистрация необходимых компонентов
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Регистрируем ArcElement для круговых диаграмм
);

const ChartsActivities = () => {
  const [activityChartData, setActivityChartData] = useState(null);
  const [itemChartData, setItemChartData] = useState(null);
  const [eventTypeChartData, setEventTypeChartData] = useState(null); // Данные по типам мероприятий
  const [locationChartData, setLocationChartData] = useState(null); // Новое состояние для данных по локациям

  const fetchActivityData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/activity/");
      const activities = response.data;

      // Группируем мероприятия по годам
      const yearCounts = {};

      // Собираем все предметы (items) из мероприятий
      const itemCounts = {};

      // Собираем типы мероприятий
      const eventTypeCounts = {};

      // Собираем локации
      const locationCounts = {};

      activities.forEach((activity) => {
        // Подсчет мероприятий по годам
        const year = activity.start_date?.split("-")[0];
        if (year) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }

        // Подсчет упоминаний предметов
        if (activity.items && Array.isArray(activity.items)) {
          activity.items.forEach((item) => {
            const itemName = item.name;
            if (itemName) {
              itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
            }
          });
        }

        // Подсчет типов мероприятий
        const eventType = activity.event_type_display;
        if (eventType) {
          eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
        }

        // Подсчет локаций
        const location = activity.location;
        if (location) {
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        }
      });

      // Формируем данные для диаграммы по годам
      const sortedYears = Object.entries(yearCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      const yearLabels = sortedYears.map(([year]) => year);
      const yearData = sortedYears.map(([, count]) => count);

      setActivityChartData({
        labels: yearLabels,
        datasets: [
          {
            label: "Количество мероприятий",
            data: yearData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      });

      // Формируем данные для диаграммы топ-20 предметов
      const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      const itemLabels = sortedItems.map(([name]) => name);
      const itemCountsData = sortedItems.map(([, count]) => count);

      setItemChartData({
        labels: itemLabels,
        datasets: [
          {
            label: "Количество упоминаний",
            data: itemCountsData,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      });

      // Формируем данные для круговой диаграммы типов мероприятий
      const eventTypeLabels = Object.keys(eventTypeCounts);
      const eventTypeData = Object.values(eventTypeCounts);

      setEventTypeChartData({
        labels: eventTypeLabels,
        datasets: [
          {
            label: "Упоминаний",
            data: eventTypeData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });

      // Формируем данные для круговой диаграммы топ локаций
      const sortedLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1]) // Сортировка по убыванию
        .slice(0, 10); // Берем первые 10 локаций
      const locationLabels = sortedLocations.map(([location]) => location);
      const locationData = sortedLocations.map(([, count]) => count);

      setLocationChartData({
        labels: locationLabels,
        datasets: [
          {
            label: "Упоминаний",
            data: locationData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(199, 199, 199, 0.6)",
              "rgba(255, 105, 180, 0.6)",
              "rgba(0, 255, 255, 0.6)",
              "rgba(128, 0, 128, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(199, 199, 199, 1)",
              "rgba(255, 105, 180, 1)",
              "rgba(0, 255, 255, 1)",
              "rgba(128, 0, 128, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#353535",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        Статистика мероприятий
      </h3>

      {/* Диаграмма по годам */}
      {activityChartData ? (
        <div style={{ marginTop: "20px" }}>
          <Bar
            data={activityChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Количество мероприятий по годам",
                },
              },
              scales: {
                x: {
                  type: "category",
                  title: {
                    display: true,
                    text: "Год",
                  },
                },
                y: {
                  type: "linear",
                  title: {
                    display: true,
                    text: "Количество мероприятий",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666", textAlign: "center" }}>
          Загрузка данных...
        </p>
      )}

      {/* Гистограмма топ-20 предметов */}
      {itemChartData ? (
        <div style={{ marginTop: "40px" }}>
          <Bar
            data={itemChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Топ-20 предметов по количеству упоминаний",
                },
              },
              scales: {
                x: {
                  type: "category",
                  title: {
                    display: true,
                    text: "Предмет",
                  },
                },
                y: {
                  type: "linear",
                  title: {
                    display: true,
                    text: "Количество упоминаний",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666", textAlign: "center" }}>
          Загрузка данных...
        </p>
      )}

      {/* Круговая диаграмма типов мероприятий */}
      {eventTypeChartData ? (
        <div style={{ marginTop: "40px" }}>
          <Pie
            data={eventTypeChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "right",
                },
                title: {
                  display: true,
                  text: "Распределение типов мероприятий",
                },
              },
            }}
          />
        </div>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666", textAlign: "center" }}>
          Загрузка данных...
        </p>
      )}

      {/* Круговая диаграмма топ локаций */}
      {locationChartData ? (
        <div style={{ marginTop: "40px" }}>
          <Pie
            data={locationChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "right",
                },
                title: {
                  display: true,
                  text: "Топ локаций по количеству мероприятий",
                },
              },
            }}
          />
        </div>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666", textAlign: "center" }}>
          Загрузка данных...
        </p>
      )}
    </div>
  );
};

export default ChartsActivities;
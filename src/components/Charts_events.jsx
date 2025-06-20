import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Регистрация необходимых компонентов
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartsEvents = () => {
  const [chartData, setChartData] = useState(null);
  const [locationChartData, setLocationChartData] = useState(null);
  const [participantChartData, setParticipantChartData] = useState(null);
  const [durationChartData, setDurationChartData] = useState(null);

  const fetchEventData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/event/");
      const events = response.data;

      // Группируем события по годам
      const yearCounts = {};
      const locationCounts = {};
      const participantCounts = {};
      const durationData = [];

      events.forEach((event) => {
        // Подсчет событий по годам
        const year = event.start_date?.split("-")[0];
        if (year) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }

        // Подсчет упоминаний локаций
        const location = event.location;
        if (location) {
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        }

        // Подсчет упоминаний участников
        if (event.participants && Array.isArray(event.participants)) {
          event.participants.forEach((participant) => {
            const fullName = participant.full_name;
            if (fullName) {
              participantCounts[fullName] = (participantCounts[fullName] || 0) + 1;
            }
          });
        }

        // Расчет продолжительности событий
        if (event.start_date && event.end_date) {
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);
          const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          durationData.push({
            title: event.title,
            duration: durationInDays,
          });
        }
      });

      // Сортируем данные
      const sortedYears = Object.entries(yearCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      const sortedLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      const sortedParticipants = Object.entries(participantCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      const sortedDurations = durationData.sort((a, b) => b.duration - a.duration).slice(0, 10);

      // Формируем данные для диаграмм
      const yearLabels = sortedYears.map(([year]) => year);
      const yearData = sortedYears.map(([, count]) => count);

      const locationLabels = sortedLocations.map(([location]) => location);
      const locationData = sortedLocations.map(([, count]) => count);

      const participantLabels = sortedParticipants.map(([name]) => name);
      const participantData = sortedParticipants.map(([, count]) => count);

      const durationLabels = sortedDurations.map((event) => event.title);
      const durationValues = sortedDurations.map((event) => event.duration);

      setChartData({
        labels: yearLabels,
        datasets: [
          {
            label: "Количество событий",
            data: yearData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });

      setLocationChartData({
        labels: locationLabels,
        datasets: [
          {
            label: "Локаций",
            data: locationData,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#C9CBCF",
              "#E7E9ED",
              "#3366CC",
              "#DC3912",
            ],
            hoverOffset: 4,
          },
        ],
      });

      setParticipantChartData({
        labels: participantLabels,
        datasets: [
          {
            label: "Участников",
            data: participantData,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#C9CBCF",
              "#E7E9ED",
              "#3366CC",
              "#DC3912",
            ],
            hoverOffset: 4,
          },
        ],
      });

      setDurationChartData({
        labels: durationLabels,
        datasets: [
          {
            label: "Продолжительность событий (дни)",
            data: durationValues,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  };

  useEffect(() => {
    fetchEventData();
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
        Статистика событий
      </h3>

      {/* Диаграмма по годам */}
      {chartData ? (
        <div style={{ marginTop: "20px" }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Количество событий по годам",
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
                    text: "Количество событий",
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

      {/* Гистограмма продолжительности событий */}
      {durationChartData ? (
        <div style={{ marginTop: "40px" }}>
          <h4
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#353535",
              marginBottom: "20px",
              textAlign: "left",
            }}
          >
            Продолжительность событий
          </h4>
          <Bar
            data={durationChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Продолжительность событий (дни)",
                },
              },
              scales: {
                x: {
                  type: "category",
                  title: {
                    display: true,
                    text: "Событие",
                  },
                },
                y: {
                  type: "linear",
                  title: {
                    display: true,
                    text: "Продолжительность (дни)",
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

      {/* Круговая диаграмма по локациям */}
      {locationChartData ? (
        <div style={{ marginTop: "40px" }}>
          <h4
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#353535",
              marginBottom: "20px",
              textAlign: "left",
            }}
          >
            Топ локаций по упоминанию
          </h4>
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
                  text: "Топ 10 упоминаемых локаций",
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

      {/* Круговая диаграмма по участникам */}
      {participantChartData ? (
        <div style={{ marginTop: "40px" }}>
          <h4
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#353535",
              marginBottom: "20px",
              textAlign: "left",
            }}
          >
            Топ участников по упоминанию
          </h4>
          <Pie
            data={participantChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "right",
                },
                title: {
                  display: true,
                  text: "Топ 10 упоминаемых участников",
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

export default ChartsEvents;
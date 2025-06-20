import React, { useState } from "react";
import ChartsEvents from "../components/Charts_events";
import ChartsActivities from "../components/Charts_activities";

const Charts = () => {
  const [activeTab, setActiveTab] = useState("events");
  document.title = "Лента времени - Статистики"

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Кнопки переключения */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: activeTab === "events" ? "#4AB80F" : "#f0f0f0",
            color: activeTab === "events" ? "white" : "#353535",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() => setActiveTab("events")}
        >
          События
        </button>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: activeTab === "activities" ? "#4AB80F" : "#f0f0f0",
            color: activeTab === "activities" ? "white" : "#353535",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() => setActiveTab("activities")}
        >
          Мероприятия
        </button>
      </div>

      {/* Отображение соответствующего компонента */}
      {activeTab === "events" && <ChartsEvents />}
      {activeTab === "activities" && <ChartsActivities />}
    </div>
  );
};

export default Charts;
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const bg = api.fileUrl(event.cover_image);

  return (
    <div
      className="event-card"
      style={{ backgroundImage: bg ? `url(${bg})` : undefined }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <div className="event-card-overlay" />
      <div className="event-card-content">
        <h2>{event.title}</h2>
        <p>{formatDate(event.event_date)}</p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEvent(id).then(setEvent).catch(() => {});
  }, [id]);

  if (!event) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Назад
      </button>

      <div className="detail-card">
        <h1>{event.title}</h1>
        <p className="detail-meta">
          {formatDate(event.event_date)}
          {event.place ? ` · ${event.place}` : ""}
        </p>

        {event.description && <p className="detail-description">{event.description}</p>}

        {event.photos?.length > 0 && (
          <div className="photo-grid">
            {event.photos.map((photo) => (
              <img key={photo.id} src={api.fileUrl(photo.image_url)} alt="" />
            ))}
          </div>
        )}
      </div>

      <button className="icon-btn edit-btn" onClick={() => navigate(`/events/${id}/edit`)}>
        ✎
      </button>
    </div>
  );
}

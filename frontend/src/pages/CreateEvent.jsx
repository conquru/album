import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const previews = photos.map((file) => URL.createObjectURL(file));

  const handleFiles = (e) => {
    setPhotos((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Укажите название события");
      return;
    }
    try {
      const event = await api.createEvent(
        { title, event_date: date, place, description },
        photos
      );
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-page">
      <form className="event-form" onSubmit={handleSubmit}>
        <input
          className="field-title"
          placeholder="Название:"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="field"
          type="date"
          placeholder="Дата:"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="field"
          placeholder="Место:"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
        <textarea
          className="field field-description"
          placeholder="Описание:"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {previews.length > 0 ? (
          <div className="photo-preview-grid" onClick={() => fileRef.current?.click()}>
            {previews.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        ) : (
          <button type="button" className="icon-btn photo-btn" onClick={() => fileRef.current?.click()}>
            📎
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFiles}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          создать событие
        </button>
      </form>
    </div>
  );
}

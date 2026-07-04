import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getEvent(id).then((event) => {
      setTitle(event.title || "");
      setDate(event.event_date ? event.event_date.slice(0, 10) : "");
      setPlace(event.place || "");
      setDescription(event.description || "");
      setExistingPhotos(event.photos || []);
    });
  }, [id]);

  const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));

  const handleFiles = (e) => {
    setNewPhotos((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleRemoveExisting = async (photoId) => {
    await api.deletePhoto(id, photoId);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Укажите название события");
      return;
    }
    try {
      await api.updateEvent(id, { title, event_date: date, place, description }, newPhotos);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Удалить это событие безвозвратно?")) return;
    await api.deleteEvent(id);
    navigate("/");
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

        {(existingPhotos.length > 0 || newPreviews.length > 0) && (
          <div className="photo-preview-grid">
            {existingPhotos.map((photo) => (
              <div className="photo-preview-item" key={photo.id}>
                <img src={api.fileUrl(photo.image_url)} alt="" />
                <button type="button" onClick={() => handleRemoveExisting(photo.id)}>
                  ×
                </button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        )}

        <button type="button" className="icon-btn photo-btn" onClick={() => fileRef.current?.click()}>
          📎
        </button>
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
          сохранить изменения
        </button>
        <button type="button" className="delete-btn" onClick={handleDeleteEvent}>
          удалить событие
        </button>
      </form>
    </div>
  );
}

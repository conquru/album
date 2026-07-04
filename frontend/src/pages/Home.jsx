import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import Navbar from "../components/Navbar.jsx";
import EventCard from "../components/EventCard.jsx";
import Dots from "../components/Dots.jsx";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    api.getEvents().then(setEvents).catch(() => {});
  }, []);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(events.length - 1, index));
    const child = track.children[clamped];
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let closestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const dist = Math.abs(childCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  };

  return (
    <div className="feed-page">
      <Navbar />

      {events.length > 0 && (
        <>
          <button className="nav-arrow nav-arrow-left" onClick={() => scrollToIndex(active - 1)}>
            ←
          </button>
          <button className="nav-arrow nav-arrow-right" onClick={() => scrollToIndex(active + 1)}>
            →
          </button>
        </>
      )}

      <div className="feed-track" ref={trackRef} onScroll={handleScroll}>
        {events.map((event) => (
          <div className="feed-slide" key={event.id}>
            <EventCard event={event} />
          </div>
        ))}
        {events.length === 0 && (
          <div className="empty-state">
            <p>Пока нет событий. Нажмите «+», чтобы добавить первое воспоминание.</p>
          </div>
        )}
      </div>

      <Dots count={events.length} active={active} />
    </div>
  );
}

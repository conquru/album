import React from "react";

export default function Dots({ count, active }) {
  if (count <= 1) return null;

  // Показываем максимум 5 точек, активная всегда по центру логики "окна"
  const windowSize = 5;
  let start = Math.max(0, active - Math.floor(windowSize / 2));
  let end = Math.min(count, start + windowSize);
  start = Math.max(0, end - windowSize);

  const dots = [];
  for (let i = start; i < end; i++) {
    dots.push(i);
  }

  return (
    <div className="dots">
      {dots.map((i) => (
        <span key={i} className={`dot ${i === active ? "dot-active" : ""}`} />
      ))}
    </div>
  );
}

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../App.jsx";

export default function Navbar() {
  const { user, setUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const updated = await api.updateAvatar(file);
    setUser(updated);
  };

  return (
    <div className="navbar">
      <button className="icon-btn add-btn" onClick={() => navigate("/events/new")}>
        +
      </button>

      <div
        className="profile"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="avatar">
          {user?.avatar_url ? (
            <img src={api.fileUrl(user.avatar_url)} alt="avatar" />
          ) : (
            <span className="avatar-placeholder" />
          )}
        </div>

        {open && (
          <div className="profile-dropdown">
            <p className="profile-name">{user?.username}</p>
            <button onClick={() => fileRef.current?.click()}>Сменить аватар</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <button onClick={logout}>Выйти</button>
          </div>
        )}
      </div>
    </div>
  );
}

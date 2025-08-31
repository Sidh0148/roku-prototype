import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:8000/categories";

function VideoCard({ video, onSelect, onPlay }) {
  return (
    <button
      className="card"
      tabIndex="0"
      onClick={() => onSelect(video)} // open details
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(video);
        }
        if (e.key.toLowerCase() === "p") {
          e.preventDefault();
          onPlay(video);
        }
      }}
      aria-label={`Open details for ${video.title}`}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="thumb"
        loading="lazy"
      />
      <div className="meta">
        <div className="title">{video.title}</div>
      </div>
    </button>
  );
}

function DetailsModal({ video, onPlay, onClose }) {
  if (!video) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalContent">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="detailThumb"
          />
          <div className="detailInfo">
            <h2>{video.title}</h2>
            <p className="description">
              {video.description || "No description available."}
            </p>
            <p>
              <strong>Year:</strong> {video.year} &nbsp;|&nbsp;
              <strong>Rating:</strong> {video.rating}
            </p>
            <p>
              <strong>Duration:</strong> {video.duration}
            </p>
            <p>
              <strong>Genres:</strong> {video.genres?.join(", ")}
            </p>
            <button
              className="playBtn"
              onClick={() => onPlay(video)}
              aria-label={`Play ${video.title}`}
            >
              ▶ Play
            </button>
          </div>
        </div>
        <button className="closeBtn" onClick={onClose} aria-label="Close details">
          ✕
        </button>
      </div>
    </div>
  );
}

function PlayerModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <video
          src={video.url}
          controls
          autoPlay
          style={{ width: "100%", height: "auto", borderRadius: "16px" }}
        />
        <div className="modalHeader">
          <h2>{video.title}</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Close player">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [categories, setCategories] = useState({});
  const [selected, setSelected] = useState(null); // Details modal
  const [active, setActive] = useState(null); // Player modal
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || {}))
      .catch(() =>
        setError("Failed to load categories. Is the backend running on :8000?")
      );
  }, []);

  // Keyboard nav across rows/columns
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll(".row"));
    let rowIndex = 0;
    let colIndex = 0;

    const focus = () => {
      const row = rows[rowIndex];
      if (!row) return;
      const cards = row.querySelectorAll(".card");
      const card = cards[colIndex];
      if (card) {
        card.focus();
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    };

    const handler = (e) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key))
        return;

      const row = rows[rowIndex];
      if (!row) return;
      const cards = row.querySelectorAll(".card");

      if (e.key === "ArrowRight") {
        colIndex = Math.min(colIndex + 1, cards.length - 1);
      }
      if (e.key === "ArrowLeft") {
        colIndex = Math.max(colIndex - 1, 0);
      }
      if (e.key === "ArrowDown") {
        rowIndex = Math.min(rowIndex + 1, rows.length - 1);
        colIndex = 0;
      }
      if (e.key === "ArrowUp") {
        rowIndex = Math.max(rowIndex - 1, 0);
        colIndex = 0;
      }

      focus();
    };

    window.addEventListener("keydown", handler);
    setTimeout(focus, 300);

    return () => window.removeEventListener("keydown", handler);
  }, [categories]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">StreamBox</div>
      </header>

      <main className="content">
        {error && <div className="error">{error}</div>}

        {Object.entries(categories).map(([cat, vids]) => (
          <section key={cat} className="category">
            <h2 className="sectionTitle">{cat}</h2>
            <div className="row">
              {vids.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onSelect={setSelected}
                  onPlay={setActive}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <DetailsModal
        video={selected}
        onPlay={(video) => {
          setSelected(null);
          setActive(video);
        }}
        onClose={() => setSelected(null)}
      />

      <PlayerModal video={active} onClose={() => setActive(null)} />
    </div>
  );
}

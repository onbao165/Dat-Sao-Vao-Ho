import { useState } from "react";
import "./styles.css";

const adjustColor = (color) => {
  const colors = {
    blue: '#2980b9',
    red: '#c0392b',
    orange: '#d35400',
    purple: '#8e44ad',
    pink: '#c2185b'
  };
  return colors[color] || color;
};

export default function App() {
  const [flags, setFlags] = useState([
    "blue",
    "red",
    "orange",
    "purple",
    "pink",
  ]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [holes, setHoles] = useState([null, null]);
  const [message, setMessage] = useState(null);

  const totalFlags =
    flags.length + holes.filter((hole) => hole !== null).length;

  // Preload audio and keep reference
  const [starBlinkSound] = useState(() => {
    const audio = new Audio("/audio/star-blink-sound.mp3");
    audio.preload = "auto"; // Preload the audio file
    return audio;
  });

  const handleIncreaseHoles = () => {
    if (holes.length >= 7) {
      setMessage("Đã đạt số lượng hố tối đa!");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    if (totalFlags >= 7) {
      setMessage("Đã đạt số lượng cờ tối đa!");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    setHoles([...holes, null]);
  };

  const handleDecreaseHoles = () => {
    if (holes.length <= 2) {
      setMessage("Số lượng hố tối thiểu là 2!");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    setHoles(holes.slice(0, -1));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleTouchStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, holeIndex) => {
    e.preventDefault();
    if (holes[holeIndex] === null && draggedIndex !== null) {
      const newHoles = [...holes];
      newHoles[holeIndex] = flags[draggedIndex];
      
      // Play sound first, then update state
      if (newHoles.every((hole) => hole !== null)) {
        starBlinkSound.currentTime = 0; // Reset audio to start
        const playPromise = starBlinkSound.play();
        
        // Handle play promise to avoid potential errors
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Audio play failed:", error);
          });
        }
      }
      
      setHoles(newHoles);
      setFlags(flags.filter((_, index) => index !== draggedIndex));
    }
    setDraggedIndex(null);
  };

  const handleTouchEnd = (e, holeIndex) => {
    handleDrop(e, holeIndex);
  };

  const handleReset = () => {
    setFlags(["blue", "red", "orange", "purple", "pink"]);
    setHoles([null, null]);
    setMessage(null);
  };

  return (
    <div className="container">
      <img
        src="/images/star.png"
        alt="Star indicator"
        className="star"
        style={{
          filter: holes.every((hole) => hole !== null)
            ? "brightness(1) drop-shadow(0px 0px 15px rgba(255, 255, 0, 0.7))"
            : "brightness(0.5) grayscale(1)",
          transition: "filter 0.3s ease",
          width: "128px",
          height: "128px",
          objectFit: "contain"
        }}
      />

      <div className="flags-container">
        {flags.map((color, index) => (
          <div
            key={index}
            draggable
            className="flag"
            onDragStart={() => handleDragStart(index)}
            onTouchStart={() => handleTouchStart(index)}
          >
            <div className="flag-pole" />
            <div 
              className="flag-content"
              style={{
                background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="holes-container">
        {holes.map((hole, index) => (
          <div
            key={index}
            className="hole"
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            style={{
              border: hole ? `4px solid ${hole}` : "4px solid rgba(0, 0, 0, 0.8)",
            }}
          >
            {hole && (
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: hole,
                  margin: "auto",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <div className="controls">
        <button onClick={handleReset} className="button reset-button" title="Reset">
          <i className="fas fa-redo-alt"></i> Reset
        </button>
        <div style={{ display: "flex", gap: "0.5rem", justifyItems: "center" }}>
          <button onClick={handleIncreaseHoles} className="button increase-button" title="Add Hole">
            <i className="fas fa-plus"></i> Thêm hố
          </button>
          <button onClick={handleDecreaseHoles} className="button decrease-button" title="Remove Hole">
            <i className="fas fa-minus"></i> Giảm hố
          </button>
        </div>
      </div>
    </div>
  );
}

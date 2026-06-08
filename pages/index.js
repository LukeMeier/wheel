import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const months = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const spinSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    spinSound.current = new Audio("/spin.mp3");
    winSound.current = new Audio("/win.mp3");
    setPlayed(document.cookie.includes("played=true"));
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const res = await fetch("/api/status");
    const data = await res.json();
    setStatus(data);
  };

  const spin = async () => {
    if (spinning) return;

    if (!playerName.trim()) {
      alert("Bitte gib zuerst deinen Namen ein 😄");
      return;
    }

    if (document.cookie.includes("played=true")) {
      alert("Du hast bereits gedreht 😄");
      setPlayed(true);
      return;
    }

    spinSound.current.currentTime = 0;
    spinSound.current.play().catch(() => {});

    const res = await fetch("/api/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const index = months.indexOf(data.result);
    const segmentDeg = 360 / months.length;
    const targetAngle = 360 - index * segmentDeg - segmentDeg / 2;

    setResult("");
    setSpinning(true);
    setRotation(prev => prev + 360 * 10 + targetAngle);

    document.cookie = "played=true; max-age=31536000; path=/";
    setPlayed(true);

    setTimeout(() => {
      setResult(data.result);
      setSpinning(false);
      loadStatus();

      spinSound.current.pause();
      winSound.current.currentTime = 0;
      winSound.current.play().catch(() => {});

      confetti({ particleCount: 500, spread: 170, origin: { y: 0.6 } });
    }, 5200);
  };

  const available = status.reduce((sum, month) => sum + month.remaining, 0);

  return (
    <main className="container">
      <h1 className="title">🎡 12 Monate Lieblingszeit 🎉</h1>
      <div className="subtitle">✨ Dreh dein/eurern Monat für unsern Glitzermoment ✨</div>

      <input
        className="nameInput"
        placeholder="Name ..."
        value={playerName}
        disabled={played || spinning}
        onChange={e => setPlayerName(e.target.value)}
      />

      <div className="wheelWrap">
        <div className="pointer">◀</div>
        <div className="wheelLights"></div>

        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          <svg className="wheelSvg" viewBox="0 0 600 600">
            {months.map((month, i) => {
              const angle = i * 30 + 15;
              const rad = angle * Math.PI / 180;
              const x = 300 + Math.cos(rad) * 205;
              const y = 300 + Math.sin(rad) * 205;

              return (
                <text
                  key={month}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angle} ${x} ${y})`}
                >
                  {month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <button className="spinButton" onClick={spin} disabled={spinning || played}>
        {spinning ? "🎡 DREHT..." : played ? "🔒 Schon gedreht" : "JETZT DREHEN"}
      </button>

      {result && <div className="result">🔥 {playerName}, Unser Monat: {result.toUpperCase()} 🔥</div>}
    </main>
  );
}
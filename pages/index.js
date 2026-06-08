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
      body: JSON.stringify({ playerName: "Gast" })
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
      <div className="glow glowOne"></div>
      <div className="glow glowTwo"></div>

      <h1 className="title">🎡 MEGA GLÜCKSRAD 2026 🎉</h1>
      <div className="subtitle">✨ Dreh dein Schicksal ✨</div>
      <div className="counter">🎯 Noch verfügbar: {available}</div>

      <div className="wheelWrap">
        <div className="pointer">◀</div>
        <div className="wheelLights"></div>

        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          {months.map((month, i) => {
            const angle = i * 30 + 15;

            return (
              <div
                key={month}
                className="wheelText"
                style={{
                  "--angle": `${angle}deg`
                }}
              >
                {month}
              </div>
            );
          })}
        </div>
      </div>

      <button className="spinButton" onClick={spin} disabled={spinning || played}>
        {spinning ? "🎡 DREHT..." : played ? "🔒 Schon gedreht" : "🚀 JETZT DREHEN"}
      </button>

      {result && <div className="result">🔥 DU HAST {result.toUpperCase()} 🔥</div>}
    </main>
  );
}
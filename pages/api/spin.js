import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }

  const { playerName } = req.body;

  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({
      error: "Bitte gib deinen Namen ein."
    });
  }

  const monthsPath = path.join(process.cwd(), "data", "months.json");
  const lastPath = path.join(process.cwd(), "data", "last.json");

  const months = JSON.parse(fs.readFileSync(monthsPath, "utf8"));

  let lastData = { lastMonth: null };

  if (fs.existsSync(lastPath)) {
    lastData = JSON.parse(fs.readFileSync(lastPath, "utf8"));
  }

  const availableMonths = months.filter(month => month.remaining > 0);

  if (availableMonths.length === 0) {
    return res.status(200).json({
      error: "Alle Monate wurden vollständig vergeben 🎉"
    });
  }

  let possibleMonths = availableMonths.filter(
    month => month.name !== lastData.lastMonth
  );

  if (possibleMonths.length === 0) {
    possibleMonths = availableMonths;
  }

  const selected =
    possibleMonths[Math.floor(Math.random() * possibleMonths.length)];

  const index = months.findIndex(m => m.name === selected.name);

  months[index].remaining -= 1;
  months[index].players.push(playerName.trim());

  fs.writeFileSync(monthsPath, JSON.stringify(months, null, 2));

  fs.writeFileSync(
    lastPath,
    JSON.stringify({ lastMonth: selected.name }, null, 2)
  );

  res.status(200).json({
    result: selected.name
  });
}
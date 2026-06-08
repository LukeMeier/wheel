import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "data", "months.json");
  const months = JSON.parse(fs.readFileSync(filePath, "utf8"));

  res.status(200).json(months);
}
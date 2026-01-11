const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express is running!");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


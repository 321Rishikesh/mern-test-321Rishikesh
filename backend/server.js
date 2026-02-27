const express = require("express");

const app = express();

const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from API" });
});

app.post("/data", (req, res) => {
  const data = req.body;
  res.json({
    message: "Data received",
    data: data
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


app.post("/api/timetable/generate", (req, res) => {
  const { selections } = req.body;

  console.log("Received from frontend:", selections);


  res.json({
    success: true,
    message: "Timetable generated",
    timetable: selections
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

app.use(express.json());

// SQL Configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
  console.log("Successful connection to database");
});

// Startup path
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Connect user routes
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

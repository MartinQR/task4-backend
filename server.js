const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");


const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Middleware to parse the body
app.use(express.json());

// Configure the connection to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Successful connection to database");
});

// Startup path to verify that the server is working
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Conectar las rutas de usuarios
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

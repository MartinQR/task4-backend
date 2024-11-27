const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Database connection configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ----------------------- REGISTER NEW USER --------------------------//

exports.registerUser = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, first_name, last_name],
      (err, results) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ message: "The email is already registered" });
          }
          return res.status(500).json({ message: "Error registering user" });
        }
        return res
          .status(201)
          .json({ message: "Successfully registered user" });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// -------------------------- SIGN IN ------------------------------------//

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "SELECT email, password, status FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];
      console.log("User", user);

      if (user.status === "blocked") {
        return res.status(403).json({
          message: "Your account is blocked. Please contact support.",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect credentials" });
      }

      // Create a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res
        .status(200)
        .json({ message: "Inicio de sesión Successful login", token });
    }
  );
};

//----------------------GET ALL USERS--------------------------------

exports.getAllUsers = (req, res) => {
  try {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ message: "Error fetching users" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//-----------------------DELETE ONE OR MORE USERS-----------------------//

exports.deleteUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "No IDs provided or invalid format" });
  }

  try {
    let query = "";
    let queryParams = [];
    if (ids.join("") === "all") {
      query = "DELETE FROM users";
    } else {
      const placeholders = ids.map(() => "?").join(",");
      query = `DELETE FROM users WHERE id IN (${placeholders})`;
      queryParams = ids;
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting users" });
      }

      return res.status(200).json({
        message:
          ids.join("") === "all"
            ? "All users deleted successfully"
            : `${results.affectedRows} users deleted successfully`,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----------------------- BLOCK ONE OR MORE USERS ----------------------- //
exports.blockUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "No IDs provided or invalid format" });
  }

  try {
    let query = "";
    let queryParams = [];

    if (ids.join("") === "all") {
      query = "UPDATE users SET status = 'blocked'";
    } else {
      const placeholders = ids.map(() => "?").join(",");
      query = `UPDATE users SET status = 'blocked' WHERE id IN (${placeholders})`;
      queryParams = ids;
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error blocking users" });
      }

      return res.status(200).json({
        message:
          ids.join("") === "all"
            ? "All users blocked successfully"
            : `${results.affectedRows} users blocked successfully`,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//--------------------------UNBLOCK ONE OR MORE USERS-------------------//
exports.unlockUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "No IDs provided or invalid format" });
  }

  try {
    let query = "";
    let queryParams = [];

    if (ids.join("") === "all") {
      query = "UPDATE users SET status = 'active'";
    } else {
      const placeholders = ids.map(() => "?").join(",");
      query = `UPDATE users SET status = 'active' WHERE id IN (${placeholders})`;
      queryParams = ids;
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error unblocking users" });
      }

      return res.status(200).json({
        message:
          ids.join("") === "all"
            ? "All users unlocked successfully"
            : `${results.affectedRows} users unlocked successfully`,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

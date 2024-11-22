const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Database connection configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ----------------------- REGISTER NEW USER --------------------------//

exports.registerUser = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Validate that all necessary data is received
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, first_name, last_name],
      (err, results) => {
        if (err) {
          //Handle duplicates error
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ message: "The email is already registered" });
          }
          //Handle other errors
          return res
            .status(500)
            .json({ message: "Error registering user" });
        }
        return res
          .status(201)
          .json({ message: "Successfully registered user" });
      }
    );
  } catch (error) {
    //Handle unexpected errors
    return res.status(500).json({ message: "Server error" });
  }
};

// -------------------------- SIGN IN ------------------------------------//

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  // Check if the email exists
  db.query(
    
    // "SELECT * FROM users WHERE email = ?",
    "SELECT email, password FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // Verify password
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

      res.status(200).json({ message: "Inicio de sesión exitoso", token });
    }
  );
};

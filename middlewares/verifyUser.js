const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const verifyUser = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    db.query(
      "SELECT status FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User does not exist. Please log in again.",
          });
        }

        const userStatus = results[0].status;
        if (userStatus === "blocked") {
          return res.status(403).json({
            message: "Your account is blocked. Please contact support.",
          });
        }

        // If all verifications are passed continue to the next request
        next();
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyUser;

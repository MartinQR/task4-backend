const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);







module.exports = router;

const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUsers,
  blockUsers,
  unlockUsers,
} = require("../controllers/userController");
const verifyUser = require("../middlewares/verifyUser");
const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.delete("/delete", verifyUser, deleteUsers);
router.put("/block", verifyUser, blockUsers);
router.put("/unblock", verifyUser, unlockUsers);

module.exports = router;

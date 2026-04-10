const express = require("express");
const router = express.Router();

const {
  createOrLoginUser,
  saveUserState,
  getUserState,
} = require("../controllers/userController");

router.post("/session", createOrLoginUser);
router.post("/state", saveUserState);
router.get("/state", getUserState);

module.exports = router;


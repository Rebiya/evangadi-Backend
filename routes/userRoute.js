const express = require("express");
const router = express.Router();
const {
  rejester,
  login,
  checkuser,
  isOnline,
} = require("../controller/userController");
const middleware = require("../middleware/auth");

router.post("/rejester", rejester);
router.post("/login", login);
router.get("/check", middleware, checkuser);
router.get("/online_status", isOnline);

module.exports = router;

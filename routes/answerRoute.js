const express = require("express");
const answerRoute = express.Router();
const {
  answer,
  allAnswers,
  deleteAnwer,
  editAnswer,
} = require("../controller/userAnswer");
const middleware = require("../middleware/auth");
answerRoute.post("/answers/:question_id", middleware, answer);
answerRoute.get("/answers/allanswers", middleware, allAnswers);
answerRoute.delete("/delete/:answer_id", middleware, deleteAnwer);
answerRoute.put("/edit/:answer_id", middleware, editAnswer);

module.exports = answerRoute;

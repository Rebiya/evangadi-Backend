const { StatusCodes } = require("http-status-codes");
const dbConnecttion = require("../Db/dbconfig");
const { v4: uuid4 } = require("uuid");

const questions = async (req, res) => {
  const { title, descrbition } = req.body;
  const { username, id } = req.user;
  // const question_id=`questionNum${Math.floor(Math.random()*100000)}`
  const question_id = uuid4();
  //  console.log(question_id)

  if (!title || !descrbition) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "All Fields are required" });
  }
  try {
    const insertQuestion = `INSERT INTO  Questions(title,descrbition, question_id,user_id) VALUES (?,?,?,?)`;
    await dbConnecttion.query(insertQuestion, [
      title,
      descrbition,
      question_id,
      id,
    ]);

    return res.status(StatusCodes.ACCEPTED).json({ msg: "question sent" });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "internal server erorr,try again later" });
  }
};

// get a singl question from the server

const singleQuestion = async (req, res) => {
  const { id } = req.params;
  const { username } = req.user;
  try {
    const singleQuestion = `SELECT Questions.title,  Questions.descrbition From Questions WHERE question_id = ?`;
    const [singleQuestions] = await dbConnecttion.query(singleQuestion, [id]);
    if (singleQuestions.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "question not found" });
    }
    return res.status(StatusCodes.ACCEPTED).json({ singleQuestions });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "server error" });
  }
};

const allquestions = async (req, res) => {
  const { username } = req.user;
  try {
    const allquestions = `SELECT Questions.title,  Questions. descrbition, Questions. created_at ,USER.user_id,USER.firstname,Questions.question_id FROM Questions JOIN USER ON  Questions.user_id=USER.user_id`;
    const [data] = await dbConnecttion.query(allquestions);
    return res.status(StatusCodes.ACCEPTED).json({ data });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "server error" });
  }
};

module.exports = { questions, allquestions, singleQuestion };

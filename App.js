const express = require("express");
const dbConnection = require("./Db/dbconfig"); // Update to use PostgreSQL connection
const cors = require("cors");
const router = require("./routes/userRoute");
const questionRouter = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");

require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;  

app.get("/user", async (req, res) => {
const createUserTable = `
    CREATE TABLE IF NOT EXISTS \`USER\`(
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(25) NOT NULL,
      firstname VARCHAR(25) NOT NULL,
      lastname VARCHAR(25) NOT NULL,
      email VARCHAR(25) NOT NULL,
      password VARCHAR(100) NOT NULL,
      online DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
const questionTable = `
    CREATE TABLE IF NOT EXISTS \`Questions\`(
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id VARCHAR(200) NOT NULL UNIQUE,
      title VARCHAR(100) NOT NULL,
      description VARCHAR(255) NOT NULL,
      tag VARCHAR(255),
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES \`USER\`(user_id)
    )
  `;
const answerQuestion = `
    CREATE TABLE IF NOT EXISTS \`Answers\`(
      answer_id INT AUTO_INCREMENT PRIMARY KEY,
      answer VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      question_id VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES \`USER\`(user_id),
      FOREIGN KEY(question_id) REFERENCES \`Questions\`(question_id)
    )
  `;

  try {
    await dbConnection.query(createUserTable);
    await dbConnection.query(questionTable);
    await dbConnection.query(answerQuestion);
    res.send("Tables created");
  } catch (error) {
    res.status(500).send("Error creating tables: " + error.message);
  }
});

// Route Middlewares
app.use("/Api/user", router);
app.use("/Api", questionRouter);
app.use("/Api", answerRoute);

const start = async () => {
  try {
    const result = await dbConnection.query("SELECT 'test'"); // Test connection


    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    console.log("Database connected");
  } catch (error) {
    console.log("Database connection error:", error.message);
  }
};
start();

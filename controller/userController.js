const dbConnecttion = require("../Db/dbconfig");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcyrpt = require("bcrypt");
const rejester = async (req, res) => {
  const { fname, lname, email, pass, username } = req.body;

  if (!fname || !lname || !email || !pass || !username) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "All Fields Are Required." });
  }
  try {
    const selectUser = `SELECT  username,user_id FROM USER where username=?or email=? `;
    //  const users=await dbConnecttion.query(selectUser,[user,email])
    //  res.status(200).json({user:use rs[0]})

    // same as the above code
    const [users] = await dbConnecttion.query(selectUser, [username, email]);
    console.log(users);
    if (users.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User already has an account." });
    }
    //  res.status(200).json({ user: users });
    if (pass.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password should be at least 8 characters long." });
    }

    // bcyrpt password
    const salt = await bcyrpt.genSalt(10);
    const hashPassword = await bcyrpt.hash(pass, salt);
    const insertData = `INSERT INTO USER(username,firstname,lastname,email,password) VALUES (?,?,?,?,?)`;
    await dbConnecttion.query(insertData, [
      username,
      fname,
      lname,
      email,
      hashPassword,
    ]);
    res.status(StatusCodes.CREATED).json({ msg: "User created successfully." });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "internal server erorr,try again later" });
  }
};

// online status

const onlineStatus = async (user_id) => {
  const onlineUser = `UPDATE USER SET online=NOW() WHERE user_id=?`;
  await dbConnecttion.query(onlineUser, [user_id]);
};

const login = async (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "all fileds are required" });
  }

  try {
    const selectemail =
      "SELECT username,password,user_id,firstname FROM USER where email=?";
    const [useremail] = await dbConnecttion.query(selectemail, [email]);

    // res.json({ useremail });
    if (useremail.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User Not Found" });
    }
    if (useremail.length > 0) {
      await onlineStatus(useremail[0].user_id);
    }

    const isMatched = await bcyrpt.compare(pass, useremail[0].password);
    if (!isMatched) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "password not matched" });
    }
    const username = useremail[0].username;
    const id = useremail[0].user_id;
    const fname = useremail[0].firstname;

    const token = jwt.sign({ username, id }, process.env.JWT_SECRET);
    // console.log(token)
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ msg: "succesfuly login", token, fname });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error,try again later!" });
  }
};

const checkuser = async (req, res) => {
  const { username, id } = req.user;

  await onlineStatus(id);
  res.status(StatusCodes.ACCEPTED).json({ msg: "valid user", username, id });
};

const userInfo = async (req, res) => {
  const { email } = req.body;
  try {
    const infos = "SELECT * FROM USER  ";
    const [userinfos] = await dbConnecttion.query(infos);
    res
      .status(StatusCodes.ACCEPTED)
      .json({ userinfos: userinfos[userinfos?.length - 1] });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error,try again later!" });
  }
};

// check weather a user is online or offline
const isOnline = async (req, res) => {
  try {
    const selectOnlineUser = `
      SELECT user_id, 
             (CASE 
                WHEN TIMESTAMPDIFF(MINUTE, online, NOW()) <= 5 THEN 'online'
                ELSE 'offline'
              END) AS status
      FROM USER`;
    const [users] = await dbConnecttion.query(selectOnlineUser);

    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error. Try again later!" });
  }
};

// ALTER TABLE USER ADD COLUMN online DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
//  ALTER TABLE USER ADD COLUMN CREATED_AT  DEFAULT CURRENT_TIMEST no need for this

// ALTER TABLE `USER`
// ADD COLUMN online DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

module.exports = {
  rejester,
  login,
  checkuser,
  userInfo,
  isOnline,
  onlineStatus,
};

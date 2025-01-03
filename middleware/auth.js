const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { onlineStatus } = require("../controller/userController");
const middleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication invalid" });
  }
  const token = authHeader.split(" ")[1];
  //    res.send(authHeader)
  // console.log(token)
  // console.log(authHeader)
  try {
    const { username, id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // res.status(StatusCodes.ACCEPTED).json({user})
    req.user = { username, id };
    if (req.user) {
      onlineStatus(req.user.id);
    }
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication invalid" });
  }
};

module.exports = middleware;

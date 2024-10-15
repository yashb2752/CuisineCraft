const jwt = require("jsonwebtoken");
//const env = require("./env");

const jwtAuthMiddleware = (req, res, next) => {
  // first check the request headers has authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "token not found" });

  // Extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1]; //split the bearer token with space
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    //verify the jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user info to the request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// function to generate JWT token
const generateToken = (userData) => {
  // generate a new JWT token using user data

  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = { jwtAuthMiddleware, generateToken };

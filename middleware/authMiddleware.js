const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    console.log(" No JWT token found");
    res.locals.user = null;
    return next();
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
    if (err) {
      console.log(" Invalid token:", err.message);
      res.locals.user = null;
      res.clearCookie("jwt");
      return next();
    }

    try {
      console.log(" Valid token, decoded:", decodedToken);
      const user = await UserModel.findById(decodedToken.id);
      console.log("👤 User found:", user ? user : "none");
      res.locals.user = user || null;

      next();
    } catch (error) {
      console.log(" Database error:", error.message);
      res.locals.user = null;
      res.clearCookie("jwt");
      next();
    }
  });
};

module.exports.requireAuth = async (req, res, next) =>{
    const token = req.cookies?.jwt

    if(!token){
        console.log('No token valid');
        res.locals.user = null;
        return next()
        
    }
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken)=>{
        if (err) {
            console.log(err);            
        }else{
            console.log("token is:",decodedToken.id);
            next();
        }
    });
}
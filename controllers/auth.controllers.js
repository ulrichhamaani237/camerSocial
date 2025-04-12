const UserModel = require("../models/userModel");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const maxAge = 1 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  const { pseudo, email, password } = req.body;

  try {
    const user = await userModel.create({ pseudo, email, password });
    return res.status(200).json({
      user: user._id,
      data: user,
    });
  } catch (error) {
    return res.status(400).send({ error });
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    if (!user) return res.status(400).send("User not found");

    const token = createToken(user._id);

    res
      .cookie("jwt", token, { httpOnly: true, maxAge })
      .status(200)
      .json({ message: "Login successful", data: user });
  } catch (error) {
    res.status(400).json({ message: "Login failed", error });
  }
};

module.exports.logout = async (req, res) => {
  res.cookie("jwt",'',{maxAge: 1})
  res.redirect('/')
};

const userModel = require("../models/userModel");

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

module.exports.signIn = async (req, res) =>{

}

module.exports.logout = async (req, res) =>{
  
}

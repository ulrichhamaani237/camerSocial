const UserModel = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId; // recupere tous els Id de mongo db

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");

    return res.status(200).json({
      user: users,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.userInfo = async (req, res) => {
  console.log(req.params);

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown: " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id).select("-password");

    if (!user) return res.status(404).send("User not found");

    res.status(200).json(user);
  } catch (err) {
    console.log("Error fetching user info:", err);
    res.status(500).send("Server error");
  }
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown: " + req.params.id);

  try {
    const response = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      {
        new: true, // retourne le document mis à jour
        upsert: true, // crée le document s’il n’existe pas
        setDefaultsOnInsert: true, // applique les valeurs par défaut à l'insert
      }
    );

    if (!response) return res.status(404).send("User not found");

    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID");

  try {
    const response = await UserModel.findByIdAndDelete(req.params.id);

    if (!response) return res.status(404).send("User not found");

    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.follow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idFollow))
    return res.status(400).send("ERROE ID");

  try {
    // ajout dans la liste des followers de  l utilisateur
    const response = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { following: req.body.idFollow },
      },
      { new: true, upsert: true }
    );
    if (!response) return res.status(400).send("ERROR follow");

    // ajout la personne quil suit

    const docs = await UserModel.findByIdAndUpdate(
      req.body.idFollow,
      {
        $addToSet: { followers: req.params.id },
      },
      { new: true, upsert: true }
    );

    if (!docs) return res.status(400).send("ERROR ");

    return res.status(200).json({ response: response, docs: docs });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "une erreur est survenue", error: error });
    console.log(error);
  }
};

module.exports.unfollow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.idToUnFollow))
    return res.status(400).send("ERROE ID");

  try {
    // retirer dans la liste des followers de  l utilisateur
    const response = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { following: req.body.idToUnFollow },
      },
      { new: true, upsert: true }
    );
    if (!response) return res.status(400).send("ERROR unfollow");

    // retirer la personne quil suit

    const docs = await UserModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      {
        $pull: { followers: req.params.id },
      },
      { new: true, upsert: true }
    );

    if (!docs) return res.status(400).send("ERROR ");

    return res.status(200).json({ response: response, docs: docs });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "une erreur est survenue", error: error });
  }
};

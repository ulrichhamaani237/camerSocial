const userModel = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const path = require('path');
const sanitize = require('sanitize-filename'); 
const { uploadError } = require("../utils/errorsUtils");

module.exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier envoyé" });
    }

    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error("Fichier non valide. Formats acceptés : JPG, JPEG, PNG.");
    }

    if (req.file.size > 500000) {
      throw new Error("Fichier trop volumineux (max 500 Ko)");
    }

    const newFileName = req.body.name
      ? sanitize(req.body.name) + ".jpg"
      : Date.now() + ".jpg";

    const destPath = `${__dirname}/../client/public/upload/profil/${newFileName}`;

    // Déplacement du fichier
    await fs.promises.rename(req.file.path, destPath);

    // Mise à jour de l'utilisateur
    const user = await userModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./upload/profil/" + newFileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    // Envoi de la réponse finale
    return res.status(200).json({
      message: "Fichier uploadé avec succès",
      file: newFileName,
      user,
    });

  } catch (error) {
     console.error("Erreur upload est :", error.message);
    const err = uploadError(error);
    return res.status(400).json(err);
  }
};


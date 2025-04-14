const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const { uploadError } = require("../utils/errorsUtils");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

module.exports.readPost = async (req, res) => {
  try {
    const postsList = await postModel.find().sort({ createdAt: -1 });
    if (!postsList) {
      res.status(400).json({ message: "erreur" });
    }
    res.status(200).json({ posts: postsList });
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports.createPost = async (req, res) => {
  const posterId = req.params.id;
  let fileName;

  if (req.file != null) {
    try {
      const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(
          "Fichier non valide. Formats acceptés : JPG, JPEG, PNG."
        );
      }

      if (req.file.size > 500000) {
        throw new Error("Fichier trop volumineux (max 500 Ko)");
      }
    } catch (error) {
      const err = uploadError(error);
      return res.status(400).json({ err });
    }

    fileName = req.body.posterId + Date.now() + ".jpg";
    const destPath = `${__dirname}/../client/public/upload/posts/${fileName}`;
    await fs.promises.rename(req.file.path, destPath);
  }

  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    picture: req.file != null ? "./upload/posts/" + fileName : "",
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();

    if (!post) res.status(400).send("erreur de creation du post");

    res.status(200).json({ post: post });
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports.updatePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID: " + req.params.id);

  const updateRecord = {
    message: req.body.message,
  };

  try {
    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateRecord },
      { new: true, runValidators: true } // Ajout de runValidators
    );

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    return res.status(200).json({
      message: "Update successful",
      data: updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during update",
      error: error.message,
    });
  }
};

module.exports.deletePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID: " + req.params.id);

  try {
    const docs = await postModel.findByIdAndDelete(req.params.id);

    if (!docs) return res.status(400).send("Error deleted");

    res.status(200).json({ message: "deleted successful", data: docs });
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID: " + req.params.id);

  try {
    const docs = await postModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true }
    );

    if (!docs) res.status(400).send("error updated");

    res.status(200).json({ message: "likes add successfun", data: docs });

    const docs2 = await userModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true }
    );

    if (!docs2) res.status(400).send("erruer add");

    return res.status(200).json({
      message: "post kiked successful",
      data: { res1: docs, res2: docs2 },
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.unlikePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("incorrect params: " + req.params.id);

  try {
    const response1 = await postModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true }
    );

    if (!response1) res.status.send("error unliksed for post");

    const response2 = await userModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true }
    );

    if (!response2) res.status(400).send("error unliked for user");

    return res.status(200).json({ message: "unliked successful" });
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.commentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: "ID invalide" });

  try {
    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );

    if (!updatedPost) return res.status(404).json({ error: "Post non trouvé" });
    return res.json(updatedPost);
  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports.editCommentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: "ID invalide" });

  try {
    const editedPost = await postModel.findById(req.params.id);
    if (!editedPost) return res.status(404).send("Post non trouvé");

    const comment = editedPost.comments.find((comment) =>
      comment._id.equals(req.body.commenterId)
    );

    if (!comment) return res.status(404).send("Commentaire non trouvé");

    comment.text = req.body.text;

    await editedPost.save();
    return res.status(200).json({ message: "Commentaire modifié", comment });
  } catch (error) {
    console.error("Erreur dans editCommentPost:", error);
    return res.status(500).send(error);
  }
};

module.exports.deleteComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.body.commentId;

  if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId))
    return res.status(400).json({ error: "ID invalide" });

  try {
    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      { new: true }
    );

    if (!updatedPost) return res.status(404).send("Post non trouvé");

    return res.status(200).json({
      message: "Commentaire supprimé avec succès",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire :", error);
    return res.status(500).send(error);
  }
};

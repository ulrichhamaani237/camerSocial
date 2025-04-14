/**
 * @typedef {import('mongoose').Document & {
*   postId: string,
*   message: string,
*   picture: string,
*   video: string,
*   likers: Array,
*   comments: Array
* }} PostDocument
*/
const mongoose = require("mongoose");

const PostShema = new mongoose.Schema(
  {
    posterId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    picture: {
      type: String,
    },
    video: {
      type: String,
    },
    likers: {
      type: [String],
      required: true,
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterPseudo: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
  },
  {
    timestamp: true,
  }
);

const PostModel = mongoose.model("post", PostShema);

module.exports = PostModel;

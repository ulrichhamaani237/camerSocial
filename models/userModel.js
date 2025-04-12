/**
 * @typedef {import('mongoose').Document & {
*   pseudo: string,
*   email: string,
*   password: string
* }} UserDocument
*/
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bycript = require('bcrypt')

const userSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,         // ✅ corrigé
    minlength: 3,
    maxlength: 55,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,         // ✅ corrigé
    validate: [isEmail],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,         // ✅ corrigé
    maxlength: 1024,        // ✅ corrigé
    minlength: 4
  },
  picture: {
    type: String,
    default: './uploads/profil/random-user.png'
  },
  bio: {
    type: String,
    max: 1024
  },
  followers: {
    type: [String]
  },
  following: {
    type: [String]
  },
  likes: {
    type: [String]
  }
},{
    timestamps: true
});

// execution de la fonction avant l enregistrement.
userSchema.pre('save', async function (next) {
    const salt = await bycript.genSalt();
    this.password = await bycript.hash(this.password, salt)
    next()
})

userSchema.statics.login = async function (email, password) {
  const user = await UserModel.findOne({email});
  if (user) {
    const auth = await bycript.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password')
  }
  throw Error('incorrect email')
}

const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;

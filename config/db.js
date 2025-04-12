const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://"+process.env.DB_USER_PASS+"@cluster0.yozxkoq.mongodb.net/projet-mern"
  )
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

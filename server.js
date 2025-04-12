const express = require("express");
require("dotenv").config({ path: "./config/.env" });
const userRoute = require("./routes/user.routes");
const bodyParser = require("body-parser");
const app = express();
require("./config/db");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json())
app.use("/api/user", userRoute);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

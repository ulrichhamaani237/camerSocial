const router = require("express").Router();
const autController = require("../controllers/auth.controllers");
const userControllers = require("../controllers/userControllers");
const uploadControllers = require("../controllers/uploadControllers");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" }); 

// auth
router.post("/register", autController.signUp);
router.post("/login", autController.signIn);
router.get("/logout", autController.logout);

router.get("/", userControllers.getAllUsers);
router.get("/:id", userControllers.userInfo);
router.put("/:id", userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);
router.patch("/follow/:id", userControllers.follow);
router.patch("/unfollow/:id", userControllers.unfollow);

// uppload
router.post("/upload", upload.single("file"), uploadControllers.uploadFile);
module.exports = router;

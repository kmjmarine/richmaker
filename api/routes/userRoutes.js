const express = require("express");
const userRoutes = express.Router();
const { userControllers }  = require("../controllers")
const { loginRequired } = require("../utils/auth");

userRoutes.post("/presignin", userControllers.presignIn);
userRoutes.post("/CI", userControllers.getCIByPhoneNumber);
userRoutes.post("/signup", userControllers.signUp);
userRoutes.post("/signin", userControllers.signIn);
userRoutes.post("/password",loginRequired, userControllers.changePassword)
userRoutes.post("/profileimage", loginRequired, userControllers.updateProfileImage);
userRoutes.get("/profileimage/:userId", userControllers.getDefaultProfileImage);

module.exports = userRoutes;

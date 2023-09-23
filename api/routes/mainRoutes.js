const express = require("express");
const mainRoutes = express.Router();
const { mainControllers } = require("../controllers");
const { loginRequired } = require("../utils/auth");

mainRoutes.get("/", loginRequired, mainControllers.mainInfo);

module.exports = mainRoutes;

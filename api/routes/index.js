const express = require("express");
const route = express.Router();
const mainRoutes = require("./mainRoutes");
const groupRouter = require("./groupRouter");
const userRoutes = require("./userRoutes");
const providerRoutes = require("./providerRoutes");

route.use("/main", mainRoutes);
route.use("/user", userRoutes);
route.use("/group", groupRouter);
route.use("/providers", providerRoutes);

module.exports = route;

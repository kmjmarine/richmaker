const express = require("express");
const providerRoutes = express.Router();
const { providerControllers } = require("../controllers");
const { loginRequired } = require("../utils/auth");

providerRoutes.get("/", loginRequired, providerControllers.selectProviders);
providerRoutes.get(
  "/finances?",
  loginRequired,
  providerControllers.getUserFinances
);
providerRoutes.post(
  "/transactions",
  loginRequired,
  providerControllers.postTransactions
);

module.exports = providerRoutes;

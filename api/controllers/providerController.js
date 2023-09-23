const { providerServices } = require("../services");
const { catchAsync } = require("../utils/error");
const request = require("request-promise");

const selectProviders = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user.id) {
    const error = new Error("NOT USERID");
    error.statusCode = 400;
    throw error;
  }
  const providersInfo = await providerServices.getProvidersInfo(user.id);
  res.status(201).json(providersInfo);
});

const getUserFinances = catchAsync(async (req, res) => {
  const providerID = req.query;
  const user = req.user;

  if (!user.id || !providerID) {
    const error = new Error("NOT INFO");
    error.statusCode = 400;
    throw error;
  }
  const userFinances = await providerServices.getUserFinances(
    user.id,
    providerID
  );
  res.status(200).json(userFinances);
});

const postTransactions = async (req, res) => {
  try {
    const data = req.body.data;
    const user = req.user;

    if (!user.id || !data) {
      const error = new Error("NOT INFO");
      error.statusCode = 404;
      throw error;
    }

    await providerServices.postTransactions(user.id, data);
    res.status(200).json({ message: "SUCCESS CREATED" });
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
};

module.exports = { selectProviders, getUserFinances, postTransactions };

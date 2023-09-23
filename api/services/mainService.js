const mainDao = require("../models/mainDao");

const depositsAmount = async (userID, month) => {
  return await mainDao.depositsAmount(userID, month);
};

const expensesAmount = async (userID, month) => {
  return await mainDao.expensesAmount(userID, month);
};

const monthlyExpenseAmounts = async (userID, month) => {
  return await mainDao.monthlyExpenseAmounts(userID, month);
};

const expectedExpenseAmounts = async (userID, month) => {
  return await mainDao.expectedExpenseAmounts(userID, month);
};

const variableExpenseAmounts = async (userID, month) => {
  return await mainDao.variableExpenseAmounts(userID, month);
};

const amountsBycategories = async (userID, month) => {
  return await mainDao.amountsBycategories(userID, month);
};

module.exports = {
  depositsAmount,
  expensesAmount,
  monthlyExpenseAmounts,
  expectedExpenseAmounts,
  variableExpenseAmounts,
  amountsBycategories,
};

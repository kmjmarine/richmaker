const mainService = require("../services/mainService");
const { catchAsync } = require("../utils/error");

const mainInfo = catchAsync(async (req, res) => {
  const user = req.user;
  const { month } = req.query;

  if (!user.id || !month) {
    const error = new Error("INVAILD_KEYERROR");
    error.statusCode = 400;
    throw error;
  }

  try {
    const depositsResult = await mainService.depositsAmount(user.id, month);
    const expensesResult = await mainService.expensesAmount(user.id, month);
    const monthlyExpensesResult = await mainService.monthlyExpenseAmounts(
      user.id,
      month
    );
    const expectedExpenseResult = await mainService.expectedExpenseAmounts(
      user.id,
      month
    );
    const variableExpenseResult = await mainService.variableExpenseAmounts(
      user.id,
      month
    );
    const amountsBycategoriesResult = await mainService.amountsBycategories(
      user.id,
      month
    );

    res.status(200).json({
      data: {
        depositsAmount: depositsResult[0]?.depositsAmount || "0",
        expensesAmount: expensesResult[0]?.expensesAmount || "0",
        monthlyExpenseAmounts:
          monthlyExpensesResult[0]?.monthlyExpenseAmounts || "0",
        expectedExpenseAmounts:
          expectedExpenseResult[0]?.expectedExpenseAmounts || "0",
        variableExpenseAmounts:
          variableExpenseResult[0]?.variableExpenseAmounts || "0",
        amountsBycategories: amountsBycategoriesResult,
      },
    });
  } catch {
    const error = new Error("dataSource Error #mainInfo");
    error.statusCode = 400;
    throw error;
  }
});

module.exports = { mainInfo };

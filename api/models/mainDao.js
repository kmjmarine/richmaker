const { AppDataSource } = require("./dataSource");

const depositsAmount = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT ROUND(SUM(t.amount)) AS depositsAmount
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        WHERE u.id = ? AND amount > 0 AND MONTH(t.created_at) = ?;
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const expensesAmount = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT ROUND(SUM(t.amount)) AS expensesAmount
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        WHERE u.id = ? AND amount < 0 AND MONTH(t.created_at) = ?;
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const monthlyExpenseAmounts = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT ROUND(SUM(t.amount)) AS monthlyExpenseAmounts
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        WHERE u.id = ? AND amount < 0 AND is_monthly = 1 AND MONTH(t.created_at) = ? AND t.created_at <= now();
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const expectedExpenseAmounts = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT ROUND(SUM(t.amount)) AS expectedExpenseAmounts
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        WHERE u.id = ? AND amount < 0 AND is_monthly = 1 AND MONTH(t.created_at) = ? AND t.created_at > now();
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const variableExpenseAmounts = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT ROUND(SUM(t.amount)) AS variableExpenseAmounts
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        WHERE u.id = ? AND amount < 0 AND is_monthly = 0 AND MONTH(t.created_at) = ?;
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const amountsBycategories = async (userID, month) => {
  try {
    const results = await AppDataSource.query(
      `
        SELECT c.category_name AS id, 
        c.category_name AS label, 
        ROUND(ABS(SUM(t.amount))) AS value,
        CONCAT('hsl(', FLOOR(0 + RAND() * 999), ', 70%, 50%)') AS color   
        FROM users u LEFT JOIN user_finances uf
        ON u.id = uf.user_id 
        LEFT JOIN transactions t
        ON uf.id = t.user_finances_id
        LEFT JOIN categories c 
        ON c.id = t.category_id
        WHERE u.id = ? AND amount < 0 AND MONTH(t.created_at) = ?
        GROUP BY c.category_name
      `,
      [userID, month]
    );
    return results;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

module.exports = {
  depositsAmount,
  expensesAmount,
  monthlyExpenseAmounts,
  expectedExpenseAmounts,
  variableExpenseAmounts,
  amountsBycategories,
};

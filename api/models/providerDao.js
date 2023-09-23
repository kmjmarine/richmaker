const { AppDataSource } = require("./dataSource");

const getProvidersInfo = async (userID, type) => {
  try {
    const providersInfo = await AppDataSource.query(
      `SELECT 
        p.id AS providerID, 
        p.provider_name AS name, 
        p.type AS type, 
        p.image_url AS URL, 
        CASE WHEN u.provider_id 
          IS NOT NULL THEN 1 
          ELSE 0 END AS isAlready 
        FROM providers p 
        LEFT JOIN (SELECT provider_id FROM user_finances WHERE user_id = ?) u 
        on p.id = u.provider_id
        WHERE type = ?`,
      [userID, type]
    );
    return providersInfo;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const getUserCI = async (userID) => {
  try {
    const getUserCI = await AppDataSource.query(
      `SELECT 
        CI 
        FROM users 
        WHERE id = ?`,
      [userID]
    );
    return getUserCI;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const getProviderImageAndName = async (providerID) => {
  try {
    const [getProviderNameAndImage] = await AppDataSource.query(
      `SELECT 
        providers.provider_name AS providerName,
        providers.image_url AS imageUrl, 
        providers.id AS providerID
        FROM providers 
        WHERE id = ?`,
      [providerID]
    );
    return getProviderNameAndImage;
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const insertUserFinances = async (
  userID,
  providerID,
  financeNumber,
  financeName
) => {
  try {
    const userFinancesId = await AppDataSource.query(
      `INSERT INTO 
        user_finances 
        (user_id, provider_id, finance_number, finance_name)
        values 
        (?,?,?,?)`,
      [userID, providerID, financeNumber, financeName]
    );
    return userFinancesId.insertId;
  } catch (err) {
    console.log(err);
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const insertTransactions = async (
  userFinancesID,
  amount,
  transactionNote,
  categoryID,
  isMonthly,
  createdAT
) => {
  try {
    await AppDataSource.query(
      `insert into 
        transactions 
          (user_finances_id,
          amount,
          transaction_note,
          category_id,
          is_monthly,
          created_at) 
        values (?,?,?,?,?,?)
          `,
      [
        userFinancesID,
        amount,
        transactionNote,
        categoryID,
        isMonthly,
        createdAT.replace("T", " ").replace("Z", ""),
      ]
    );
  } catch {
    const error = new Error("DATASOURCE_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

module.exports = {
  getProvidersInfo,
  getUserCI,
  getProviderImageAndName,
  insertUserFinances,
  insertTransactions,
};

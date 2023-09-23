const providerDao = require("../models/providerDao");
const request = require("request-promise");
const { typeEnum } = require("../models/typeEnum");
const { decrypt } = require("../utils/crypto");

const getProvidersInfo = async (userID) => {
  let type;
  let data = {};

  type = typeEnum.TYPE_C;
  let providerCard = await providerDao.getProvidersInfo(userID, type);
  data.card = providerCard;

  type = typeEnum.TYPE_B;
  let providerBank = await providerDao.getProvidersInfo(userID, type);
  data.bank = providerBank;

  return data;
};

const getUserCI = async (userID) => {
  const [userCI] = await providerDao.getUserCI(userID);
  return userCI.CI;
};

const getProviderImageAndName = async (ID) => {
  const providerNameAndName = ID.map((index) => {
    return providerDao.getProviderImageAndName(index);
  });
  const results = await Promise.all(providerNameAndName);
  return results;
};

const getUserFinances = async (userID, providerID) => {
  try {
    const CI = await getUserCI(userID);
    let ID;
    if (providerID.b && providerID.c) {
      const b = providerID.b.split(",");
      const c = providerID.c.split(",");
      ID = b.concat(c);
    } else if (!providerID.b) {
      ID = providerID.c.split(",");
    } else if (!providerID.c) {
      ID = providerID.b.split(",");
    }
    let userFinances;
    userFinances = await getProviderImageAndName(ID);

    const options = {
      method: "POST",
      uri: "http://10.58.52.75:3000/mydata/account",
      body: {
        CI: CI,
        providerIDs: ID,
      },
      json: true,
    };

    const req = await request(options);
    const response = decrypt(req.data);

    userFinances.map((providerInfo) => {
      providerInfo.items = [];
      response.map((financeInfo) => {
        if (providerInfo.providerID == financeInfo.providerID) {
          delete providerInfo.providerID;
          providerInfo.items.push(financeInfo);
        }
      });
    });

    console.dir(userFinances, { depth: null });

    return userFinances;
  } catch {
    const error = new Error("SERVICES_KEY_ERROR");
    error.stausCode = 400;
    throw error;
  }
};

const postTransactions = async (userID, data) => {
  const CI = await getUserCI(userID);

  await Promise.all(
    data.map(async (obj) => {
      let providerID = obj.providerID;
      let financeNumber = obj.financeNumber;
      let financeName = obj.financeName;

      const userFinancesID = await providerDao.insertUserFinances(
        userID,
        providerID,
        financeNumber,
        financeName
      );

      const options = {
        method: "POST",
        uri: "http://10.58.52.75:3000/mydata",
        body: {
          CI: CI,
          userFinancesId: userFinancesID,
          providerID: providerID,
          financeNumber: financeNumber,
        },
        json: true,
        resolveWithFullResponse: false,
        simple: false,
      };

      const responseFromAccountTransaction = await request(options);

      if (responseFromAccountTransaction.message == "NO_RECORDS") {
        const error = new Error("NO_RECORDS");
        error.statusCode = 403;
        throw error;
      }

      const res = decrypt(responseFromAccountTransaction.data);
      const response = res[0];

      response.map(async (obj) => {
        let amount = obj.amount;
        let transactionNote = obj.transactionNote;
        let categoryID = obj.categoryID;
        let isMonthly = obj.isMonthly;
        let createdAT = obj.createdAT;

        await providerDao.insertTransactions(
          userFinancesID,
          amount,
          transactionNote,
          categoryID,
          isMonthly,
          createdAT
        );
      });
    })
  );
};

module.exports = {
  getProvidersInfo,
  getUserFinances,
  postTransactions,
};

const CryptoJS = require("crypto-js");

const encrypt = (strings) => {
  try {
    var encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(strings),
      process.env.TRANSACTIONS_SECRET
    ).toString();

    return encrypted;
  } catch {
    const error = new Error("ENCRYPT FAIL");
    error.statusCode = 400;

    return;
  }
};

const decrypt = (strings) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      strings,
      process.env.TRANSACTIONS_SECRET
    );

    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decrypted;
  } catch {
    const error = new Error("DECRYPT FAIL");
    error.statusCode = 400;

    return;
  }
};

module.exports = { encrypt, decrypt };

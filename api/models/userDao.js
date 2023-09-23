const { AppDataSource } = require("./dataSource");

const phoneNumberCheck = async (phoneNumber) => {
  try {
    const result = await AppDataSource.query(
      `
      SELECT
        phone_number
      FROM users
      WHERE phone_number = ?
      `,
      [phoneNumber]
    );
    return result;
  } catch {
    const error = new Error("INVALID_USER");
    error.stausCode = 400;
    throw error;
  }
};

const createUser = async (userName, phoneNumber, hashedPassword, CI) => {
  try {
    const result = await AppDataSource.query(
      `
        INSERT INTO users (
          CI,
          user_name, 
          phone_number,
          password,
          CI
        ) VALUES (
          ?,
          ?,
          ?,
          ?
        )
      `,
      [userName, phoneNumber, hashedPassword, CI]
    );
    return result;
  } catch{
    const error = new Error("dataSource Error #createUser");
    error.statusCode = 400;
    throw error;
  }
};


const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    const [result] = await AppDataSource.query(
      `
        SELECT
          id,
          user_name,
          phone_number,
          profile_image,
          password
        FROM users
        WHERE phone_number = ?
      `,
      [phoneNumber]
    );
    return result;
  } catch {
    const error = new Error("dataSource phoeNumber Error");
    error.statusCode = 400;

    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const [result] = await AppDataSource.query(
      `
        SELECT 
          id,
          user_name,
          phone_number,
          password
          FROM users
          WHERE id = ?
      `,
      [id]
    );

    return result;
  } catch {
    const error = new Error("dataSource id Error");
    error.statusCode = 400;
    throw error;
  }
};

const findUserByUsername = async(id) => {
  try{
    const [result] = await AppDataSource.query(
      `
      SELECT
      id,
      user_name,
      password
      FROM users
      WHERE id = ?
      `,
      [id]
    );
    return result;
  }catch{
    const error = new Error("SELECT ERROR");
    error.statusCode = 401;
    throw error;
  }
};

const updatePassword = async(userId, hashedPassword) =>{
  try{
    const result = await AppDataSource.query(
      `
      UPDATE users
      SET
      password = ?
      WHERE id= ?
      `,
    [hashedPassword, userId]
    );
    return result;
  }catch{
    const error = new Error("invalid password");
    error.statusCode = 400;
    throw error;
  }
}

const updateProfileImageURL = async(id,uploadedFileURL) =>{
  try{
    const result = await AppDataSource.query(
      `
      UPDATE users
      SET
      profile_image = ?
      WHERE id= ?
      `,
      [uploadedFileURL, id]
    );
    return result
  }catch{
    const eroor = new Error("URL dataSource ERROR");
    eroor.statusCode = 400;
    throw error;
  }
}

const getDefaultProfileImage  = async(userId) => {
  try{
    const result = await AppDataSource.query(
      `
      SELECT
      id,
      profile_image
      FROM users
      WHERE id = ?
      `,
      [userId]
    );
    return result
  }catch{
    const error = new Error("dataSource Error");
    error.stautsCode = 400;
    throw error
  }
}

module.exports = { 
  phoneNumberCheck, 
  createUser, 
  getUserByPhoneNumber, 
  getUserById,
  findUserByUsername,
  updatePassword,
  updateProfileImageURL,
  getDefaultProfileImage
};

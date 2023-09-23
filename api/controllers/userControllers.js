require('dotenv').config();
const { userServices } = require("../services");
const { catchAsync } = require("../utils/error");
const { S3Client } = require("@aws-sdk/client-s3");
const request = require("request-promise");
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "wecode-richmaker-project-2",
    key: function(req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now().toString()}`);
    }
  })
});

const presignIn = catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    const error = new Error("not phoneNumber");
    error.statusCode = 400;
    throw error;
  }

  const phoneNumberCheck = await userServices.presignIn(phoneNumber);

  if (phoneNumberCheck.length === 0) {
    return res.json({ message: "INVALID_USER" });
  } else {
    res.status(201).json({ message: "user is confirmed" });
  }
});

const getCIByPhoneNumber = catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;
    const options = {
      method: 'POST',
      uri: 'http://10.58.52.62:3000/auth',
      body: {
        phoneNumber: phoneNumber
      },
      json: true
    };

    const responseBody = await request(options);

    if (responseBody) {
      return res.status(200).json({ message: "Successful authentication", CI: responseBody.CI});
    } else {
      const error = new Error("not Personal authentication");
      error.status = 400;
      throw error;
    }
});

const signUp = catchAsync(async (req, res) => {
  const { userName, phoneNumber,password, CI} = req.body;
  if (!userName || !password || !phoneNumber|| !CI) {
    const error = new Error("KEY ERROR");
    error.statusCode = 400;
    throw error;
  }
  const membership =  await userServices.signUp(
    userName, phoneNumber,password, CI
  );
  res.status(200).json({ message: "user is created" });
});


const signIn = catchAsync(async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    const error = new Error("KEY ERROR");
    error.statusCode = 400;
    throw error;
  }

  const { accessToken, userName, profileImage , id} = await userServices.signIn(
    phoneNumber,
    password,
  );
  res.status(201).json({
    id: id,
    accessToken: accessToken,
    userName: userName,
    phoneNumber: phoneNumber,
    profileImage: profileImage,
  });
});

const changePassword  = catchAsync(async(req, res) =>{
  const {id} = req.user;

  const {existingPassword, newPassword} = req.body;

  if(!id || !existingPassword || !newPassword){
    const error = new Error("KEY ERROR");
    error.stauts = 400;
    throw error;
  }
  const change = await userServices.changePassword(id, existingPassword, newPassword);
  if(change.message === "INVALID_PASSWORD"){
    res.status(201).json({message: "INVALID_PASSWORD" });
  }else{
  res.status(201).json({message: "changePassword"});
  }
})

const updateProfileImage = catchAsync(async (req, res) => {

  upload.single('image')(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ errors: [{ title: 'File Upload Error', detail: err.message }] });
    }
    const uploadedFileURL = req.file.location;

    const {id} = req.user;
    const profileImage = await userServices.updateProfileImageURL(id, uploadedFileURL);

    res.status(200).json({ profileImage: req.file.location });
  });
});

const getDefaultProfileImage = catchAsync(async(req, res) => {
  
  const userId = req.params.userId;
  const result = await userServices.getDefaultProfileImage(userId)
  
  res.status(200).json({ result });
})

module.exports = { 
  presignIn, 
  signUp, 
  signIn, 
  getCIByPhoneNumber,
  changePassword,
  updateProfileImage,
  getDefaultProfileImage
};

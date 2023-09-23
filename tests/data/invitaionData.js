const sendInvitation = [
  {
    phoneNumber: "01012341234",
  },
  {
    phoneNumber: "",
  },
  {
    phoneNumber: "01045674567",
  },
  {
    userName: "홍길동",
    password: "Password@123",
    phoneNumber: "01012341234",
  },
];

const signUp = [
  {
    userName: "홍길동",
    password: "Password@123",
    phoneNumber: "01045674567",
  },
  {
    userName: "",
    password: "Password@123",
    phoneNumber: "01045674567",
  },
  {
    userName: "홍길동",
    password: "",
    phoneNumber: "01045674567",
  },
  {
    userName: "홍길동",
    password: "Password@123",
    phoneNumber: "",
  },
];

const signIn = [
  { phoneNumber: "01045674567", password: "Password@123" },
  { phoneNumber: "", password: "Password@123" },
  { phoneNumber: "01045674567", password: "" },
];

module.exports = {
  presignIn,
  signUp,
  signIn,
};

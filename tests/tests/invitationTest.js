const request = require("supertest");

const { createApp } = require("../../app");
const { AppDataSource } = require("../../api/models/dataSource");
const userTestData = require("../data/userData");

describe("userTest", () => {
  let app;

  beforeAll(async () => {
    app = createApp();
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS=0");
    await AppDataSource.query(`TRUNCATE users`);
    await AppDataSource.query(`ALTER TABLE users AUTO_INCREMENT = 1`);
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS=1");

    await AppDataSource.destroy();
  });

  test("preSignIn : SUCCESS", async () => {
    await request(app).post("/user/signup").send(userTestData.presignIn[3]);
    const response = await request(app)
      .post("/user/presignin")
      .send(userTestData.presignIn[0]);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({ message: "user is confirmed" });
  });

  test("preSignIn : not phoneNumber", async () => {
    const response = await request(app)
      .post("/user/presignin")
      .send(userTestData.presignIn[1]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "not phoneNumber" });
  });

  test("preSignIn: INVALID_USER", async () => {
    const response = await request(app)
      .post("/user/presignin")
      .send(userTestData.presignIn[2]);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "INVALID_USER" });
  });

  test("signUp : SUCCESS", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(userTestData.signUp[0]);

    expect(response.body).toEqual({ message: "user is created" });
    expect(response.statusCode).toEqual(201);
  });

  test("signUp : KEY_ERROR_USERNAME", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(userTestData[1]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "KEY ERROR" });
  });
  test("signUp : KEY_ERROR_PASSWORD", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(userTestData[2]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "KEY ERROR" });
  });
  test("signUp : KEY_ERROR_PHONENUMBER", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(userTestData[3]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "KEY ERROR" });
  });

  test("signIn : SUCCESS", async () => {
    const response = await request(app)
      .post("/user/signin")
      .send(userTestData.signIn[0]);
    expect(response.body).toHaveProperty(
      "accessToken",
      "userName",
      "phoneNumber",
      "profileImage"
    );
    expect(response.statusCode).toEqual(201);
  });
  test("signIn : KEY_ERROR_PHONENUMBER", async () => {
    const response = await request(app)
      .post("/user/signin")
      .send(userTestData.signIn[1]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "KEY ERROR" });
  });
  test("signIn : KEY_ERROR_PASSWORD", async () => {
    const response = await request(app)
      .post("/user/signin")
      .send(userTestData.signIn[2]);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ message: "KEY ERROR" });
  });
});

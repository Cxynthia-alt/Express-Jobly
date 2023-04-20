"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", () => {
  const newJob = {
    title: "new",
    salary: 12000,
    equity: 0,
    companyHandle: "c3"
  }

  test("ok for users", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)

    expect(resp.statusCode).toEqual(201)
    expect(resp.body).toEqual({
      job: newJob
    })
  })
})

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
  u2Token
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
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201)
    expect(resp.body).toEqual({
      job: newJob
    })
  })

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 20000,
        equity: 0
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  })

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new1",
        salary: "not-a-salary",
        equity: 0,
        companyHandle: "c3"
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  })
})

/************************************** GET /jobs */
describe("GET /jobs", () => {
  test("ok for anon", async () => {
    const resp = await request(app).get("/jobs")
    console.log(resp.body)
    expect(resp.body).toEqual({
      jobs:
        [{
          id: 1,
          title: 'j1',
          salary: 10000,
          equity: "0.3",
          companyHandle: 'c1'
        }, {
          id: 2,
          title: 'j2',
          salary: 20000,
          equity: "0",
          companyHandle: 'c2'
        }]
    })
  })

  test("filter by title", async () => {
    const resp = await request(app).get("/jobs?title=j1")
    expect(resp.body).toEqual({
      jobs:
        [{
          id: 1,
          title: 'j1',
          salary: 10000,
          equity: "0.3",
          companyHandle: 'c1'
        }]
    })
  })

  test("filter by minSalary", async () => {
    const resp = await request(app).get("/jobs?minSalary=20000")
    expect(resp.body).toEqual({
      jobs:
        [{
          id: 2,
          title: 'j2',
          salary: 20000,
          equity: "0",
          companyHandle: 'c2'
        }]
    })
  })
})



/************************************** GET /jobs/:id */
describe("GET /jobs/:id", () => {
  test("works for anon", async () => {
    const resp = await request(app).get("/jobs/1")
    expect(resp.body).toEqual({
      job:
      {
        id: 1,
        title: 'j1',
        salary: 10000,
        equity: "0.3",
        companyHandle: 'c1'
      }
    })
  })
  test("not found such job", async () => {
    const resp = await request(app).get("/jobs/nope")
    expect(resp.statusCode).toEqual(500);
  })
})



// /************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", () => {
  test("works for users", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new"
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job:
      {
        id: 1,
        title: 'j1-new',
        salary: 10000,
        equity: "0.3",
        companyHandle: 'c1'
      }
    })
  })

  test("unauth for anon", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new"
      });
    expect(resp.statusCode).toEqual(400);
  })

  test("not found on no such job", async () => {
    const resp = await request(app)
      .patch(`/jobs/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  })

  test("bad request on id change attempt", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: 3
      });
    expect(resp.statusCode).toEqual(400);
  })

  test("bad request on invalid data", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 123
      })
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(400);
  })

})


/************************************** DELETE /jobs/:id */
describe("DELETE /jobs/:id", () => {
  test("works for auth", async () => {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  })

  test("unauth for anon", async () => {
    const resp = await request(app)
      .delete(`/jobs/1`)
    expect(resp.statusCode).toEqual(400);
  })

  test("not found for no such job", async () => {
    const resp = await request(app)
      .delete(`/jobs/22`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  })

})

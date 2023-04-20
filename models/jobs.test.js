"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", () => {
  const newJob = {
    title: "new",
    salary: 12000,
    equity: 0,
    companyHandle: "c3"
  }
  test("works", async () => {
    let job = await Job.create(newJob)
    expect(job).toEqual(newJob)
    const result = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs WHERE id = $1`, [3])
    expect(result.rows[0])toEqual({
      id: 3,
      title: "new",
      salary: 12000,
      equity: 0,
      companyHandle: "c3"
    })
  })
})


/************************************** findAll */
describe("findAll", () => {
  test("works: no filter", async () => {
    let jobs = await Job.findAll()
    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 10000,
        equity: 0.3
  companyHandle: "c1"
      },
      {
        id: 2,
        title: "j2",
        salary: 20000,
        equity: 0
  companyHandle: "c2"
      }
    ])
  })
})

/************************************** filterByTitle */
describe("filterByTitle", () => {
  test("works", async () => {
    let job = await Job.filterByTitle('j1')
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 10000,
      equity: 0.3
      companyHandle: "c1"
    })
  })

  test("not found if no such job", async () => {
    try {
      await Job.filterByTitle("nope")
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})

/************************************** filterByMinSalary */
describe("filterByMinSalary", () => {
  test("works", async () => {
    let job = await Job.filterByMinSalary(20000)
    expect(job).toEqual({
      id: 2,
      title: "j2",
      salary: 20000,
      equity: 0
      companyHandle: "c2"
    })
  })

  test("not find if no such job", async () => {
    try {
      await Job.filterByMinSalary(50000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})

/************************************** get */
describe("get", () => {
  test("works", async () => {
    let job = await Job.get(1)
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 10000,
      equity: 0.3
      companyHandle: "c1"
    })
  })

  test("not find if no such job", async () => {
    try {
      await Job.get(5);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

})


/************************************** update */
describe("update", () => {
  const updateData = {
    title: "j5",
    salary: 1000,
    equity: 0.3
  }

  test("works", async () => {
    let job = await job.update(1, updateData)
    expect(job).toEqual({
      id: 1,
      companyHandle: "c1"
      ...updateData
    })

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`, [1]
    )
    expect(result.rows[0]).toEqual({
      id: 1,
      title: "j5",
      salary: 1000,
      equity: 0.3,
      companyHandle: "c1"
    })
  })

  test("works: null fields", async () => {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null
    }
    let job = await Job.update(1, updateDataSetNulls)
    expect(job).toEqual({
      id: 1,
      companyHandle: "c1",
      ...updateDataSetNulls
    })

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`, [1]
    )
    expect(result.rows[0]).toEqual({
      id: 1,
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1"
    })
  })

  test("not found if no such job", async () => {
    try {
      await Job.update(5, updateData)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("bad request with no data", async () => {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})

/************************************** remove */
describe("remove", () => {
  test("works", async () => {
    await Job.remove(1)
    const res = await db.query(`SELECT id
    FROM jobs
    WHERE id = $1`, [1])
    expect(res.rows.length).toEqual(0)

  })

  test("not found if no such job", async () => {
    try {
      await Job.remove(5)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})

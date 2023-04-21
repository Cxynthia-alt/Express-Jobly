"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */
router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body)
    return res.status(201).json({ job });
  } catch (err) {
    return next(err)
  }
})


/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
  try {
    if (req.query["title"]) {
      let { title } = req.query
      const jobs = await Job.filterByTitle(title)
      return res.json({ jobs })
    }
    if (req.query["minSalary"]) {
      let { minSalary } = req.query
      const jobs = await Job.filterByMinSalary(minSalary)
      return res.json({ jobs })
    }
    if (req.query["hasEquity"] === true) {
      const jobs = await Job.filterByHasEquity()
      return res.json({ jobs })
    }
    const jobs = await Job.findAll()
    return res.json({ jobs })
  } catch (err) {
    return next(err);
  }
})


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle}
 *   where id = id
 *
 * Authorization required: none
 */

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id)
    return res.json({ job })
  } catch (err) {
    return next(err);
  }

})


/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err);
  }
}
)

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */


router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id)
    return res.json({ deleted: req.params.id })
  } catch (err) {
    return next(err);
  }

})
module.exports = router;

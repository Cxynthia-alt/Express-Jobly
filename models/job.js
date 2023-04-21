"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create a job (from data), update db, return new job data.
 *
 * data should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, companyHandle}
 *
 * Throws BadRequestError if job already in database.
 * */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs(title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, parseFloat(equity), companyHandle]
    )
    const job = result.rows[0]
    job.equity = parseFloat(job.equity)
    return job
  }

  /** Find all jobs.
 *
 * Returns [{ id, title, salary, equity, companyHandle }, ...]
 * */
  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      ORDER BY id`
    )
    return jobsRes.rows
  }

  /* Filter jobs by title that contains certain text
  Returns [{ id, title, salary, equity, companyHandle }, ...]
  */

  static async filterByTitle(text) {
    const jobsRes = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title ~* $1`, [text])
    if (jobsRes.rows.length === 0) { throw new NotFoundError(`No job name contains ${text}`) }
    return jobsRes.rows
  }

  /* Filter jobs by minSalary
Returns [{ id, title, salary, equity, companyHandle }, ...]
*/
  static async filterByMinSalary(min) {
    const jobsRes = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE salary >= $1`, [min])
    if (jobsRes.rows.length === 0) throw new NotFoundError(`No job salary is at least ${min}`);
    return jobsRes.rows
  }

  /* Filter jobs by hasEquity
Returns [{ id, title, salary, equity, companyHandle }, ...]
*/

  static async filterByHasEquity() {
    const jobsRes = await db.query(`SELECT * FROM jobs WHERE equity >= 0`)
    return jobsRes.rows
  }

  /** Given a job id, return data about job.
 *
 * Returns { id, title, salary, equity, companyHandle}
 *
 * Throws NotFoundError if not found.
 **/
  static async get(id) {
    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`, [id]
    )
    const job = jobsRes.rows[0]
    if (!job) throw new NotFoundError(`No job id found: ${id}`);
    return job;
  }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data)
    const handleVarIdx = "$" + (values.length + 1)

    const querySql = `UPDATE jobs
    SET ${setCols}
    WHERE id = ${handleVarIdx}
    RETURNING id, title, salary, equity, company_handle AS "companyHandle"`

    const result = await db.query(querySql, [...values, id])
    const job = result.rows[0]
    if (!job) throw new NotFoundError(`No job id found: ${id}`);
    return job;
  }

  /** Delete given job from database; returns undefined.
 *
 * Throws NotFoundError if job not found.
 **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (result.rows.length === 0) throw new NotFoundError(`No job id found: ${id}`);
  }

}
module.exports = Job

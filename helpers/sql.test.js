const { sqlForPartialUpdate } = require("./sql")


describe("sqlForPartialUpdate", () => {
  test("return setCols and values", () => {
    const dataToUpdate = { "firstName": "Aliya", "age": 32 }
    const jsToSql = { "firstName": "first_name" }
    const res = sqlForPartialUpdate(dataToUpdate, jsToSql)

    expect(res).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32]
    })
  })
})

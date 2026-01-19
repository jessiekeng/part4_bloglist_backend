const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('./list_helper.test')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})
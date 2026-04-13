const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');

async function getAll() {
  const res = await docClient.scan({ TableName: tables.categories }).promise();
  return (res.Items || []).sort((a, b) => {
    if (!a.name || !b.name) return 0;
    return a.name.localeCompare(b.name);
  });
}

async function create(name) {
  const item = { id: randomUUID(), name };
  await docClient.put({ TableName: tables.categories, Item: item }).promise();
  return item;
}

async function remove(id) {
  await docClient.delete({ TableName: tables.categories, Key: { id } }).promise();
}

module.exports = { getAll, create, remove };

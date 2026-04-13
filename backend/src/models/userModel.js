const { docClient, tables } = require('../dbInit');

async function findByUsername(username) {
  const res = await docClient.get({
    TableName: tables.users,
    Key: { username },
  }).promise();
  return res.Item;
}

module.exports = { findByUsername };

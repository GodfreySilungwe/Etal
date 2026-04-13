const { docClient, APP_TABLE } = require('../dbInit');

async function findByUsername(username) {
  const res = await docClient.get({
    TableName: APP_TABLE,
    Key: { PK: `USER#${username}`, SK: 'MAIN' },
  }).promise();
  return res.Item;
}

module.exports = { findByUsername };

const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function getAll() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'CATEGORY' },
  }).promise();
  return (res.Items || []).sort((a, b) => {
    if (!a.name || !b.name) return 0;
    return a.name.localeCompare(b.name);
  });
}

async function create(name) {
  const id = randomUUID();
  const item = {
    PK: `CATEGORY#${id}`,
    SK: 'MAIN',
    GSI1PK: 'CATEGORY',
    GSI1SK: name,
    id,
    type: 'CATEGORY',
    name,
    createdAt: new Date().toISOString(),
  };
  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();
  return item;
}

async function remove(id) {
  await docClient.delete({
    TableName: APP_TABLE,
    Key: { PK: `CATEGORY#${id}`, SK: 'MAIN' },
  }).promise();
}

module.exports = { getAll, create, remove };

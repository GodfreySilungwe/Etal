const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function list() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'TESTIMONIAL' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

async function create(data) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `TESTIMONIAL#${id}`,
    SK: 'MAIN',
    GSI1PK: 'TESTIMONIAL',
    GSI1SK: createdAt,
    id,
    type: 'TESTIMONIAL',
    author: data.author || null,
    content: data.content,
    created_at: createdAt,
  };
  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();
  return item;
}

async function remove(id) {
  await docClient.delete({
    TableName: APP_TABLE,
    Key: { PK: `TESTIMONIAL#${id}`, SK: 'MAIN' },
  }).promise();
}

module.exports = { list, create, remove }; 

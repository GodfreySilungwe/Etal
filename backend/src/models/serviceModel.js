const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function getAll() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'SERVICE' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

async function create(service) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `SERVICE#${id}`,
    SK: 'MAIN',
    GSI1PK: 'SERVICE',
    GSI1SK: createdAt,
    id,
    type: 'SERVICE',
    name: service.name,
    description: service.description || null,
    image_url: service.image_url || null,
    price: service.price != null ? service.price : 0,
    created_at: createdAt,
  };
  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();
  return item;
}

async function update(id, service) {
  const params = {
    TableName: APP_TABLE,
    Key: { PK: `SERVICE#${id}`, SK: 'MAIN' },
    UpdateExpression: 'SET #name = :name, #description = :description, #image_url = :image_url, #price = :price, #gsi1sk = :gsi1sk',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#description': 'description',
      '#image_url': 'image_url',
      '#price': 'price',
      '#gsi1sk': 'GSI1SK',
    },
    ExpressionAttributeValues: {
      ':name': service.name,
      ':description': service.description || null,
      ':image_url': service.image_url || null,
      ':price': service.price != null ? service.price : 0,
      ':gsi1sk': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await docClient.update(params).promise();
  return res.Attributes;
}

async function remove(id) {
  await docClient.delete({
    TableName: APP_TABLE,
    Key: { PK: `SERVICE#${id}`, SK: 'MAIN' },
  }).promise();
}

module.exports = { getAll, create, update, remove }; 

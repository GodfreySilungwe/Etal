const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');

async function getAll() {
  const res = await docClient.scan({ TableName: tables.services }).promise();
  return (res.Items || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

async function create(service) {
  const item = {
    id: randomUUID(),
    name: service.name,
    description: service.description || null,
    image_url: service.image_url || null,
    price: service.price != null ? service.price : 0,
    created_at: new Date().toISOString(),
  };
  await docClient.put({ TableName: tables.services, Item: item }).promise();
  return item;
}

async function update(id, service) {
  const params = {
    TableName: tables.services,
    Key: { id },
    UpdateExpression: 'SET #name = :name, #description = :description, #image_url = :image_url, #price = :price',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#description': 'description',
      '#image_url': 'image_url',
      '#price': 'price',
    },
    ExpressionAttributeValues: {
      ':name': service.name,
      ':description': service.description || null,
      ':image_url': service.image_url || null,
      ':price': service.price != null ? service.price : 0,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await docClient.update(params).promise();
  return res.Attributes;
}

async function remove(id) {
  await docClient.delete({ TableName: tables.services, Key: { id } }).promise();
}

module.exports = { getAll, create, update, remove }; 

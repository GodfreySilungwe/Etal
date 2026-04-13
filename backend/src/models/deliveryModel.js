const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function create(data) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `DELIVERY#${id}`,
    SK: 'MAIN',
    GSI1PK: 'DELIVERY',
    GSI1SK: createdAt,
    id,
    type: 'DELIVERY',
    delivery_address: data.delivery_address,
    phone: data.phone,
    order_details: data.order_details,
    product_id: data.product_id || null,
    product_price: data.product_price != null ? data.product_price : null,
    createdAt,
  };

  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();
  return item;
}

async function list() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'DELIVERY' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

module.exports = { create, list }; 

const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');
const productModel = require('./productModel');

async function create(data) {
  const { customer_name, phone, email, product_details } = data;
  const details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `INVOICE#${id}`,
    SK: 'MAIN',
    GSI1PK: 'INVOICE',
    GSI1SK: createdAt,
    id,
    type: 'INVOICE',
    customer_name,
    phone,
    email: email || null,
    product_details: details,
    requested_at: createdAt,
  };

  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();

  if (Array.isArray(details)) {
    for (const product of details) {
      if (!product || !product.id) continue;
      await productModel.adjustStock(product.id, -1);
    }
  }

  return item;
}

async function list() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'INVOICE' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

module.exports = { create, list }; 

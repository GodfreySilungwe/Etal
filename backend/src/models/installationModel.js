const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function create(data) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const item = {
    PK: `INSTALLATION#${id}`,
    SK: 'MAIN',
    GSI1PK: 'INSTALLATION',
    GSI1SK: createdAt,
    id,
    type: 'INSTALLATION',
    customer_name: data.customer_name,
    phone: data.phone,
    customer_location: data.customer_location,
    preferred_date: data.preferred_date,
    product: data.product,
    product_id: data.product_id || null,
    product_price: data.product_price != null ? data.product_price : null,
    payment_status: data.payment_status || 'pending',
    order_id: data.payment_status === 'paid' ? orderId : null,
    status: 'pending',
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
    ExpressionAttributeValues: { ':type': 'INSTALLATION' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

async function updateStatus(id, status) {
  const params = {
    TableName: APP_TABLE,
    Key: { PK: `INSTALLATION#${id}`, SK: 'MAIN' },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': status },
    ReturnValues: 'ALL_NEW',
  };
  const res = await docClient.update(params).promise();
  return res.Attributes;
}

async function updatePaymentStatus(id, payment_status) {
  const orderId = payment_status === 'paid' ? `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` : null;
  const params = {
    TableName: APP_TABLE,
    Key: { PK: `INSTALLATION#${id}`, SK: 'MAIN' },
    UpdateExpression: 'SET #payment_status = :payment_status' + (orderId ? ', #order_id = :order_id' : ''),
    ExpressionAttributeNames: {
      '#payment_status': 'payment_status',
      ...(orderId && { '#order_id': 'order_id' })
    },
    ExpressionAttributeValues: {
      ':payment_status': payment_status,
      ...(orderId && { ':order_id': orderId })
    },
    ReturnValues: 'ALL_NEW',
  };
  const res = await docClient.update(params).promise();
  return res.Attributes;
}

module.exports = { create, list, updateStatus, updatePaymentStatus }; 

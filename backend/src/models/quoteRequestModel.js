const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');

async function create(data) {
  const { customer_name, phone, email, details, product_details } = data;
  let items = [];

  try {
    items = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  } catch (e) {
    items = [];
  }

  const normalizedItems = Array.isArray(items)
    ? items.map((item) => {
        const qty = Number(item?.quantity) || 1;
        const price = Number(item?.price) || 0;
        const originalPrice = item?.discount_percent > 0 ? (Number(item?.original_price) || price) : price;
        return {
          id: item?.id ?? null,
          name: item?.name || 'Unknown Item',
          category: item?.category || 'Uncategorized',
          quantity: qty,
          unit_price: price,
          original_unit_price: originalPrice,
          discount_percent: Number(item?.discount_percent) || 0,
          discount_amount_per_unit: Math.max(originalPrice - price, 0),
          line_amount: price * qty,
        };
      })
    : [];

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `QUOTE#${id}`,
    SK: 'MAIN',
    GSI1PK: 'QUOTE',
    GSI1SK: createdAt,
    id,
    type: 'QUOTE',
    customer_name,
    phone,
    email: email || null,
    details: details || null,
    product_details: normalizedItems,
    status: 'pending',
    requested_at: createdAt,
  };

  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();
  return item;
}

async function list() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'QUOTE' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

async function updateStatus(id, status) {
  const params = {
    TableName: APP_TABLE,
    Key: { PK: `QUOTE#${id}`, SK: 'MAIN' },
    UpdateExpression: 'SET #status = :status, #processed_at = :processed_at',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#processed_at': 'processed_at',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':processed_at': status === 'complete' ? new Date().toISOString() : null,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await docClient.update(params).promise();
  return res.Attributes;
}

module.exports = { create, list, updateStatus }; 

const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');

async function create(data) {
  const item = {
    id: randomUUID(),
    delivery_address: data.delivery_address,
    phone: data.phone,
    order_details: data.order_details,
    product_id: data.product_id || null,
    product_price: data.product_price != null ? data.product_price : null,
    requested_at: new Date().toISOString(),
  };

  await docClient.put({ TableName: tables.deliveryRequests, Item: item }).promise();
  return item;
}

async function list() {
  const res = await docClient.scan({ TableName: tables.deliveryRequests }).promise();
  return (res.Items || []).sort((a, b) => (b.requested_at || '').localeCompare(a.requested_at || ''));
}

module.exports = { create, list }; 

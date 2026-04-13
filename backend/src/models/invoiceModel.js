const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');
const productModel = require('./productModel');

async function create(data) {
  const { customer_name, phone, email, product_details } = data;
  const details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);

  const item = {
    id: randomUUID(),
    customer_name,
    phone,
    email: email || null,
    product_details: details,
    requested_at: new Date().toISOString(),
  };

  await docClient.put({ TableName: tables.invoiceRequests, Item: item }).promise();

  if (Array.isArray(details)) {
    for (const product of details) {
      if (!product || !product.id) continue;
      await productModel.adjustStock(product.id, -1);
    }
  }

  return item;
}

async function list() {
  const res = await docClient.scan({ TableName: tables.invoiceRequests }).promise();
  return (res.Items || []).sort((a, b) => (b.requested_at || '').localeCompare(a.requested_at || ''));
}

module.exports = { create, list }; 

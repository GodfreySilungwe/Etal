const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');

async function create(data) {
  const item = {
    id: randomUUID(),
    customer_location: data.customer_location,
    preferred_date: data.preferred_date,
    product: data.product,
    product_id: data.product_id || null,
    product_price: data.product_price != null ? data.product_price : null,
    status: 'pending',
    requested_at: new Date().toISOString(),
  };

  await docClient.put({ TableName: tables.installationRequests, Item: item }).promise();
  return item;
}

async function list() {
  const res = await docClient.scan({ TableName: tables.installationRequests }).promise();
  return (res.Items || []).sort((a, b) => (b.requested_at || '').localeCompare(a.requested_at || ''));
}

async function updateStatus(id, status) {
  const params = {
    TableName: tables.installationRequests,
    Key: { id },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': status },
    ReturnValues: 'ALL_NEW',
  };
  const res = await docClient.update(params).promise();
  return res.Attributes;
}

module.exports = { create, list, updateStatus }; 

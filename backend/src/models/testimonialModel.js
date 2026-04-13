const { docClient, tables } = require('../dbInit');
const { randomUUID } = require('crypto');

async function list() {
  const res = await docClient.scan({ TableName: tables.testimonials }).promise();
  return (res.Items || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

async function create(data) {
  const item = {
    id: randomUUID(),
    author: data.author || null,
    content: data.content,
    created_at: new Date().toISOString(),
  };
  await docClient.put({ TableName: tables.testimonials, Item: item }).promise();
  return item;
}

async function remove(id) {
  await docClient.delete({ TableName: tables.testimonials, Key: { id } }).promise();
}

module.exports = { list, create, remove }; 

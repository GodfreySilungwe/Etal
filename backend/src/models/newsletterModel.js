const { docClient, tables } = require('../dbInit');

async function create(email) {
  const item = { email, subscribed_at: new Date().toISOString() };
  try {
    await docClient.put({
      TableName: tables.newsletter,
      Item: item,
      ConditionExpression: 'attribute_not_exists(email)',
    }).promise();
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return item;
    }
    throw err;
  }
  return item;
}

async function list() {
  const res = await docClient.scan({ TableName: tables.newsletter }).promise();
  return (res.Items || []).sort((a, b) => (b.subscribed_at || '').localeCompare(a.subscribed_at || ''));
}

module.exports = { create, list }; 

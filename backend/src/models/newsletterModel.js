const { docClient, APP_TABLE } = require('../dbInit');

async function create(email) {
  const item = {
    PK: `NEWSLETTER#${email}`,
    SK: 'MAIN',
    GSI1PK: 'NEWSLETTER',
    GSI1SK: new Date().toISOString(),
    email,
    type: 'NEWSLETTER',
    subscribed_at: new Date().toISOString(),
  };
  try {
    await docClient.put({
      TableName: APP_TABLE,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
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
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'NEWSLETTER' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

module.exports = { create, list }; 

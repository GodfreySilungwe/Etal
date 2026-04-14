const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
require('dotenv').config();

AWS.config.update({

  region: process.env.AWS_REGION || 'us-east-1',
});

const dynamo = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const APP_TABLE = 'ETALDYNAMODB123';

/**
 * Single-table design for DynamoDB
 * PK: EntityType#EntityId (e.g., PRODUCT#uuid, USER#admin, CATEGORY#uuid)
 * SK: Timestamp or MAIN for different query patterns
 * GSI1PK: Type-based index for queries (e.g., PRODUCTS, USERS_BY_USERNAME)
 * GSI1SK: CreatedAt or custom sort key
 */

async function ensureTable() {
  try {
    await dynamo.describeTable({ TableName: APP_TABLE }).promise();
    console.log(`DynamoDB table ${APP_TABLE} already exists`);
    return;
  } catch (err) {
    if (err.code !== 'ResourceNotFoundException') throw err;
  }

  const params = {
    TableName: APP_TABLE,
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  };

  await dynamo.createTable(params).promise();
  await dynamo.waitFor('tableExists', { TableName: APP_TABLE }).promise();
  console.log(`Created single DynamoDB table ${APP_TABLE}`);
}

async function seedDefaults() {
  const categoryId = randomUUID();
  const categoryPK = `CATEGORY#${categoryId}`;

  const categoryScan = await docClient
    .query({
      TableName: APP_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :type',
      ExpressionAttributeValues: { ':type': 'CATEGORY' },
      Limit: 1,
    })
    .promise();

  let fridgeCategoryId = categoryId;
  if (!categoryScan.Items || categoryScan.Items.length === 0) {
    await docClient
      .put({
        TableName: APP_TABLE,
        Item: {
          PK: categoryPK,
          SK: 'MAIN',
          GSI1PK: 'CATEGORY',
          GSI1SK: 'Fridges',
          id: categoryId,
          type: 'CATEGORY',
          name: 'Fridges',
          createdAt: new Date().toISOString(),
        },
      })
      .promise();
  } else {
    fridgeCategoryId = categoryScan.Items[0].id;
  }

  const productScan = await docClient
    .query({
      TableName: APP_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
      Limit: 1,
    })
    .promise();

  if (!productScan.Items || productScan.Items.length === 0) {
    const productId = randomUUID();
    await docClient
      .put({
        TableName: APP_TABLE,
        Item: {
          PK: `PRODUCT#${productId}`,
          SK: 'MAIN',
          GSI1PK: 'PRODUCT',
          GSI1SK: 'Sample Fridge Model X',
          id: productId,
          type: 'PRODUCT',
          name: 'Sample Fridge Model X',
          category_id: fridgeCategoryId,
          description: 'Energy efficient fridge with 300L capacity',
          price: 499.99,
          original_price: 499.99,
          discount_percent: 0,
          stock: 10,
          installation_price: 120.0,
          delivery_price: 80.0,
          specs: { capacity: '300L', energy_rating: 'A+' },
          image_url: '',
          createdAt: new Date().toISOString(),
        },
      })
      .promise();
  }

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'adminpass';

  const userResult = await docClient
    .get({
      TableName: APP_TABLE,
      Key: { PK: `USER#${adminUser}`, SK: 'MAIN' },
    })
    .promise();

  if (!userResult.Item) {
    const hash = await bcrypt.hash(adminPass, 10);
    const userId = randomUUID();
    await docClient
      .put({
        TableName: APP_TABLE,
        Item: {
          PK: `USER#${adminUser}`,
          SK: 'MAIN',
          GSI2PK: `USER_BY_USERNAME#${adminUser}`,
          GSI2SK: adminUser,
          id: userId,
          type: 'USER',
          username: adminUser,
          password_hash: hash,
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      })
      .promise();
    console.log('Seeded admin user:', adminUser);
  }
}

async function initDb() {
  await ensureTable();
  await seedDefaults();
}

module.exports = { initDb, docClient, APP_TABLE };

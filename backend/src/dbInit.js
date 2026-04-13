const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const dynamo = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const tables = {
  products: process.env.PRODUCTS_TABLE || 'Products',
  categories: process.env.CATEGORIES_TABLE || 'Categories',
  newsletter: process.env.NEWSLETTER_TABLE || 'NewsletterSubscribers',
  invoiceRequests: process.env.INVOICE_TABLE || 'InvoiceRequests',
  paymentReferences: process.env.PAYMENT_REFERENCES_TABLE || 'PaymentReferences',
  quoteRequests: process.env.QUOTE_REQUESTS_TABLE || 'QuoteRequests',
  installationRequests: process.env.INSTALLATION_TABLE || 'InstallationRequests',
  deliveryRequests: process.env.DELIVERY_TABLE || 'DeliveryRequests',
  testimonials: process.env.TESTIMONIALS_TABLE || 'Testimonials',
  services: process.env.SERVICES_TABLE || 'Services',
  users: process.env.USERS_TABLE || 'Users',
};

async function ensureTable(tableName, keyName) {
  try {
    await dynamo.describeTable({ TableName: tableName }).promise();
    return;
  } catch (err) {
    if (err.code !== 'ResourceNotFoundException') throw err;
  }

  const params = {
    TableName: tableName,
    AttributeDefinitions: [{ AttributeName: keyName, AttributeType: 'S' }],
    KeySchema: [{ AttributeName: keyName, KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  };

  await dynamo.createTable(params).promise();
  await dynamo.waitFor('tableExists', { TableName: tableName }).promise();
  console.log(`Created DynamoDB table ${tableName}`);
}

async function seedDefaults() {
  const categoriesResult = await docClient.scan({ TableName: tables.categories, Limit: 1 }).promise();
  let categoryId = randomUUID();
  if (!categoriesResult.Items || categoriesResult.Items.length === 0) {
    await docClient.put({
      TableName: tables.categories,
      Item: { id: categoryId, name: 'Fridges' },
    }).promise();
  } else {
    categoryId = categoriesResult.Items[0].id;
  }

  const productsResult = await docClient.scan({ TableName: tables.products, Limit: 1 }).promise();
  if (!productsResult.Items || productsResult.Items.length === 0) {
    await docClient.put({
      TableName: tables.products,
      Item: {
        id: randomUUID(),
        name: 'Sample Fridge Model X',
        category_id: categoryId,
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
    }).promise();
  }

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'adminpass';
  const userResult = await docClient.get({
    TableName: tables.users,
    Key: { username: adminUser },
  }).promise();

  if (!userResult.Item) {
    const hash = await bcrypt.hash(adminPass, 10);
    await docClient.put({
      TableName: tables.users,
      Item: {
        username: adminUser,
        id: randomUUID(),
        password_hash: hash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    }).promise();
    console.log('Seeded admin user:', adminUser);
  }
}

async function initDb() {
  await Promise.all([
    ensureTable(tables.products, 'id'),
    ensureTable(tables.categories, 'id'),
    ensureTable(tables.newsletter, 'email'),
    ensureTable(tables.invoiceRequests, 'id'),
    ensureTable(tables.paymentReferences, 'id'),
    ensureTable(tables.quoteRequests, 'id'),
    ensureTable(tables.installationRequests, 'id'),
    ensureTable(tables.deliveryRequests, 'id'),
    ensureTable(tables.testimonials, 'id'),
    ensureTable(tables.services, 'id'),
    ensureTable(tables.users, 'username'),
  ]);

  await seedDefaults();
}

module.exports = { initDb, docClient, tables };

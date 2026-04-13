const { docClient, tables } = require('../dbInit');
const categoryModel = require('./categoryModel');
const { randomUUID } = require('crypto');

function normalizeProductItem(item, categoryMap = {}) {
  return {
    id: item.id,
    name: item.name,
    category_id: item.category_id || null,
    category: item.category_id ? categoryMap[item.category_id] || null : null,
    description: item.description || null,
    price: item.price != null ? item.price : null,
    original_price: item.original_price != null ? item.original_price : null,
    discount_percent: item.discount_percent != null ? item.discount_percent : 0,
    stock: item.stock != null ? item.stock : 0,
    installation_price: item.installation_price != null ? item.installation_price : null,
    delivery_price: item.delivery_price != null ? item.delivery_price : null,
    specs: item.specs || null,
    image_url: item.image_url || null,
    createdAt: item.createdAt || null,
  };
}

async function getAll(filters = {}) {
  const params = {
    TableName: tables.products,
  };

  const exprNames = {};
  const exprValues = {};
  const conditions = [];

  if (filters.search) {
    conditions.push('(contains(#name, :search) OR contains(#description, :search))');
    exprNames['#name'] = 'name';
    exprNames['#description'] = 'description';
    exprValues[':search'] = filters.search;
  }

  if (filters.category_id) {
    conditions.push('#category_id = :category_id');
    exprNames['#category_id'] = 'category_id';
    exprValues[':category_id'] = filters.category_id;
  }

  if (conditions.length) {
    params.FilterExpression = conditions.join(' AND ');
    params.ExpressionAttributeNames = exprNames;
    params.ExpressionAttributeValues = exprValues;
  }

  const res = await docClient.scan(params).promise();
  const categories = await categoryModel.getAll();
  const categoryMap = categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  const items = (res.Items || []).map((item) => normalizeProductItem(item, categoryMap));
  return items.sort((a, b) => {
    if (a.createdAt && b.createdAt) return a.createdAt.localeCompare(b.createdAt);
    return 0;
  });
}

async function getById(id) {
  const res = await docClient.get({
    TableName: tables.products,
    Key: { id },
  }).promise();

  if (!res.Item) return null;
  const categories = await categoryModel.getAll();
  const categoryMap = categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  return normalizeProductItem(res.Item, categoryMap);
}

async function create(product) {
  const id = randomUUID();
  const item = {
    id,
    name: product.name,
    category_id: product.category_id || null,
    description: product.description || null,
    price: product.price != null ? product.price : null,
    original_price: product.original_price != null ? product.original_price : null,
    discount_percent: product.discount_percent != null ? product.discount_percent : 0,
    stock: product.stock != null ? product.stock : 0,
    installation_price: product.installation_price != null ? product.installation_price : null,
    delivery_price: product.delivery_price != null ? product.delivery_price : null,
    specs: product.specs || null,
    image_url: product.image_url || null,
    createdAt: new Date().toISOString(),
  };

  await docClient.put({ TableName: tables.products, Item: item }).promise();
  const result = await getById(id);
  return result;
}

async function update(id, product) {
  const updateExpressions = [];
  const exprNames = {};
  const exprValues = {};

  const mapping = {
    '#name': { key: 'name', value: product.name || null },
    '#category_id': { key: 'category_id', value: product.category_id || null },
    '#description': { key: 'description', value: product.description || null },
    '#price': { key: 'price', value: product.price != null ? product.price : null },
    '#original_price': { key: 'original_price', value: product.original_price != null ? product.original_price : null },
    '#discount_percent': { key: 'discount_percent', value: product.discount_percent != null ? product.discount_percent : 0 },
    '#stock': { key: 'stock', value: product.stock != null ? product.stock : 0 },
    '#installation_price': { key: 'installation_price', value: product.installation_price != null ? product.installation_price : null },
    '#delivery_price': { key: 'delivery_price', value: product.delivery_price != null ? product.delivery_price : null },
    '#specs': { key: 'specs', value: product.specs || null },
    '#image_url': { key: 'image_url', value: product.image_url || null },
  };

  let valueIndex = 1;
  for (const [name, info] of Object.entries(mapping)) {
    updateExpressions.push(`${name} = :v${valueIndex}`);
    exprNames[name] = info.key;
    exprValues[`:v${valueIndex}`] = info.value;
    valueIndex += 1;
  }

  const params = {
    TableName: tables.products,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: exprNames,
    ExpressionAttributeValues: exprValues,
    ReturnValues: 'ALL_NEW',
  };

  const res = await docClient.update(params).promise();
  const categories = await categoryModel.getAll();
  const categoryMap = categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  return normalizeProductItem(res.Attributes, categoryMap);
}

async function remove(id) {
  await docClient.delete({
    TableName: tables.products,
    Key: { id },
  }).promise();
}

async function adjustStock(id, delta) {
  const product = await docClient.get({ TableName: tables.products, Key: { id } }).promise();
  if (!product.Item) return null;
  const stock = Math.max((Number(product.Item.stock) || 0) + delta, 0);
  const res = await docClient.update({
    TableName: tables.products,
    Key: { id },
    UpdateExpression: 'SET #stock = :stock',
    ExpressionAttributeNames: { '#stock': 'stock' },
    ExpressionAttributeValues: { ':stock': stock },
    ReturnValues: 'ALL_NEW',
  }).promise();
  return res.Attributes;
}

module.exports = { getAll, getById, create, update, remove, adjustStock };

const { docClient, APP_TABLE } = require('../dbInit');
const { randomUUID } = require('crypto');
const productModel = require('./productModel');

async function create(data) {
  const { customer_name, phone, method_used, transaction_reference, product_details } = data;
  let details = [];

  try {
    details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  } catch (e) {
    details = [];
  }

  const normalizedDetails = Array.isArray(details)
    ? details.map((item) => {
        const qty = Number(item?.quantity) || 1;
        const basePrice = Number(item?.price) || 0;
        const originalUnitPrice = item?.discount_percent > 0 ? (Number(item?.original_price) || basePrice) : basePrice;
        const discountPercent = Number(item?.discount_percent) || 0;
        const installationIncluded = !!item?.installation_selected;
        const deliveryIncluded = !!item?.delivery_selected;
        const installationFee = installationIncluded ? (Number(item?.installation_price) || 0) : 0;
        const deliveryFee = deliveryIncluded ? (Number(item?.delivery_price) || 0) : 0;
        const serviceFee = installationFee + deliveryFee;
        const totalUnitPrice = basePrice + serviceFee;

        return {
          id: item?.id ?? null,
          name: item?.name || 'Unknown Item',
          category: item?.category || 'Uncategorized',
          quantity: qty,
          price: basePrice,
          original_price: originalUnitPrice,
          discount_percent: discountPercent,
          applied_discount_per_unit: Math.max(originalUnitPrice - basePrice, 0),
          installation_included: installationIncluded,
          installation_fee: installationFee,
          delivery_included: deliveryIncluded,
          delivery_fee: deliveryFee,
          service_included: serviceFee > 0,
          service_fee: serviceFee,
          total_unit_price: totalUnitPrice,
          total_price: totalUnitPrice * qty,
        };
      })
    : [];

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    PK: `PAYMENT#${id}`,
    SK: 'MAIN',
    GSI1PK: 'PAYMENT',
    GSI1SK: createdAt,
    id,
    type: 'PAYMENT',
    customer_name,
    phone,
    method_used,
    transaction_reference,
    product_details: normalizedDetails,
    service_status: 'pending',
    submitted_at: createdAt,
  };

  await docClient.put({ TableName: APP_TABLE, Item: item }).promise();

  if (Array.isArray(normalizedDetails)) {
    for (const entry of normalizedDetails) {
      if (!entry || !entry.id) continue;
      const qty = Number(entry.quantity) || 1;
      await productModel.adjustStock(entry.id, -qty);
    }
  }

  return item;
}

async function list() {
  const res = await docClient.query({
    TableName: APP_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    ExpressionAttributeValues: { ':type': 'PAYMENT' },
    ScanIndexForward: false,
  }).promise();
  return res.Items || [];
}

async function updateStatus(id, service_status) {
  const params = {
    TableName: APP_TABLE,
    Key: { PK: `PAYMENT#${id}`, SK: 'MAIN' },
    UpdateExpression: 'SET #status = :status, #processed_at = :processed_at',
    ExpressionAttributeNames: {
      '#status': 'service_status',
      '#processed_at': 'processed_at',
    },
    ExpressionAttributeValues: {
      ':status': service_status,
      ':processed_at': service_status === 'complete' ? new Date().toISOString() : null,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await docClient.update(params).promise();
  return res.Attributes;
}

module.exports = { create, list, updateStatus };

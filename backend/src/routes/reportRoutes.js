const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const invoiceModel = require('../models/invoiceModel');

router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const invoices = await invoiceModel.list();

    let totalRevenue = 0;
    const productStats = {};

    invoices.forEach((inv) => {
      let items = [];
      try {
        items = JSON.parse(inv.product_details || '[]');
      } catch (e) {
        items = [];
      }

      items.forEach((item) => {
        const price = Number(item.price) || 0;
        totalRevenue += price;
        if (!item.id) return;
        const key = item.id;
        if (!productStats[key]) {
          productStats[key] = { id: item.id, name: item.name || 'Unknown', units: 0, revenue: 0 };
        }
        productStats[key].units += 1;
        productStats[key].revenue += price;
      });
    });

    res.json({
      totalInvoices: invoices.length,
      totalRevenue,
      products: Object.values(productStats),
      invoices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

module.exports = router;

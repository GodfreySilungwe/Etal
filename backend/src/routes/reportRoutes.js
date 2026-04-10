const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const invoiceModel = require('../models/invoiceModel');
const paymentReferenceModel = require('../models/paymentReferenceModel');
const quoteRequestModel = require('../models/quoteRequestModel');

router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const invoices = await invoiceModel.list();
    const paidItems = await paymentReferenceModel.list();

    let totalRevenue = 0;
    const productStats = {};
    const categoryStats = {};
    const dayStats = {};
    const allOrders = [
      ...invoices.map((x) => ({ ...x, _source: 'invoice', _date: x.requested_at })),
      ...paidItems.map((x) => ({ ...x, _source: 'payment', _date: x.submitted_at }))
    ];

    allOrders.forEach((inv) => {
      let items = [];
      try {
        items = JSON.parse(inv.product_details || '[]');
      } catch (e) {
        items = [];
      }

      items.forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = price * qty;
        totalRevenue += lineTotal;

        const dateKey = inv._date ? new Date(inv._date).toISOString().slice(0, 10) : 'unknown';
        if (!dayStats[dateKey]) dayStats[dateKey] = { date: dateKey, units: 0, revenue: 0 };
        dayStats[dateKey].units += qty;
        dayStats[dateKey].revenue += lineTotal;

        const categoryName = item.category || 'Uncategorized';
        if (!categoryStats[categoryName]) categoryStats[categoryName] = { category: categoryName, units: 0, revenue: 0 };
        categoryStats[categoryName].units += qty;
        categoryStats[categoryName].revenue += lineTotal;

        if (!item.id) return;
        const key = item.id;
        if (!productStats[key]) {
          productStats[key] = { id: item.id, name: item.name || 'Unknown', units: 0, revenue: 0 };
        }
        productStats[key].units += qty;
        productStats[key].revenue += lineTotal;
      });
    });

    const products = Object.values(productStats).sort((a, b) => b.units - a.units);
    const categories = Object.values(categoryStats).sort((a, b) => b.units - a.units);
    const daily = Object.values(dayStats).sort((a, b) => a.date.localeCompare(b.date));
    const peakDay = daily.reduce((best, d) => (!best || d.units > best.units ? d : best), null);
    const topCategory = categories[0] || null;

    res.json({
      totalInvoices: allOrders.length,
      invoiceCount: invoices.length,
      paidReferenceCount: paidItems.length,
      totalRevenue,
      products,
      categories,
      daily,
      peakDay,
      topCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

router.get('/quotations', authenticateToken, async (req, res) => {
  try {
    const quotes = await quoteRequestModel.list();
    const byStatus = { pending: 0, complete: 0 };
    const byDay = {};

    quotes.forEach((q) => {
      const status = (q.status || 'pending').toLowerCase();
      if (status === 'complete') byStatus.complete += 1;
      else byStatus.pending += 1;

      const dateKey = q.requested_at ? new Date(q.requested_at).toISOString().slice(0, 10) : 'unknown';
      if (!byDay[dateKey]) byDay[dateKey] = { date: dateKey, count: 0 };
      byDay[dateKey].count += 1;
    });

    const daily = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
    const peakDay = daily.reduce((best, d) => (!best || d.count > best.count ? d : best), null);

    res.json({
      totalQuotes: quotes.length,
      byStatus,
      daily,
      peakDay,
      quotes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quotation report' });
  }
});

module.exports = router;

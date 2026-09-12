const express = require('express');
const router = express.Router();
const rootService = require('../services/rootInsuranceService.js');

// Helper to get agent email from request (assuming auth middleware sets req.user)
const getAgentEmail = (req) => {
  return req.user?.email || 'test-agent@newhollandfinancial.com';
};

// 1. Create Empty Quote
router.post('/quotes', async (req, res) => {
  try {
    const quote = await rootService.createQuote(getAgentEmail(req));
    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error.response?.text || error.message);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// 2. Request Prefill
router.post('/quotes/:quoteId/prefill', async (req, res) => {
  try {
    const result = await rootService.createPrefillRequest(getAgentEmail(req), req.params.quoteId, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating prefill request:', error.response?.text || error.message);
    res.status(500).json({ error: 'Failed to create prefill request' });
  }
});

// 3. Get Prefill (Polls until ready)
router.get('/quotes/:quoteId/prefill', async (req, res) => {
  try {
    const report = await rootService.getPrefillReport(getAgentEmail(req), req.params.quoteId);
    res.status(200).json(report);
  } catch (error) {
    console.error('Error getting prefill report:', error.response?.text || error.message);
    res.status(500).json({ error: 'Failed to get prefill report' });
  }
});

// 4. Update Quote
router.put('/quotes/:quoteId', async (req, res) => {
  try {
    const updatedQuote = await rootService.updateQuote(getAgentEmail(req), req.params.quoteId, req.body);
    res.status(200).json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote:', error.response?.text || error.message);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// 5. Get Coverages
router.get('/quotes/:quoteId/coverages', async (req, res) => {
  try {
    const coverages = await rootService.getAvailableCoverages(getAgentEmail(req), req.params.quoteId);
    res.status(200).json(coverages);
  } catch (error) {
    console.error('Error getting coverages:', error.response?.text || error.message);
    res.status(500).json({ error: 'Failed to get coverages' });
  }
});

module.exports = router;

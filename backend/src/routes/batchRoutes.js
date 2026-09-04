const express = require('express');

const router = express.Router();

const {
  createBatch,
  getAllBatches,
  getBatchesByProduct,
  updateBatch,
  deleteBatch
} = require('../controllers/batchController');

// Create a new batch
router.post('/', createBatch);

// Get all batches
router.get('/', getAllBatches);

// Get all batches for a product
router.get('/product/:productId', getBatchesByProduct);

// Update a batch
router.put('/:id', updateBatch);

// Delete a batch
router.delete('/:id', deleteBatch);

module.exports = router;
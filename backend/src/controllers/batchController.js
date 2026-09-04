const Batch = require('../models/Batch');
const Product = require('../models/Product');

// POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const { product, batchNumber, quantity, manufacturingDate, expiryDate } = req.body;

    // Validate required fields explicitly before query execution
    if (!product || !batchNumber || quantity === undefined || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'All fields (product, batchNumber, quantity, manufacturingDate, expiryDate) are required'
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after manufacturing date'
      });
    }

    // Verify parent product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Referenced Product does not exist'
      });
    }

    const batch = new Batch({
      product,
      batchNumber,
      quantity: Number(quantity),
      manufacturingDate,
      expiryDate
    });

    const savedBatch = await batch.save();

    return res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: savedBatch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error while creating batch'
    });
  }
};

// GET /api/batches/product/:productId
exports.getBatchesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const batches = await Batch.find({ product: productId })
      .populate('product', 'name barcode category brand')
      .sort({ expiryDate: 1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error while fetching batches'
    });
  }
};

// PUT /api/batches/:id
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { batchNumber, quantity, manufacturingDate, expiryDate } = req.body;

    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const mfgToValidate = manufacturingDate || existingBatch.manufacturingDate;
    const expToValidate = expiryDate || existingBatch.expiryDate;

    if (quantity !== undefined && Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (new Date(expToValidate) <= new Date(mfgToValidate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after manufacturing date'
      });
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error while updating batch'
    });
  }
};

// DELETE /api/batches/:id
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBatch = await Batch.findByIdAndDelete(id);

    if (!deletedBatch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
      data: deletedBatch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error while deleting batch'
    });
  }
};
// GET /api/batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('product', 'name barcode brand category unit')
      .sort({ expiryDate: 1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error while fetching all batches'
    });
  }
};
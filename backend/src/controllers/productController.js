const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const products = await productService.getAllProducts({ includeInactive });

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      count: products.length,
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product },
  });
});

const getProductByBarcode = asyncHandler(async (req, res) => {
  const product = await productService.getProductByBarcode(req.params.barcode);

  res.status(200).json({
    success: true,
    message: 'Product found successfully',
    data: { product },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

const deactivateProduct = asyncHandler(async (req, res) => {
  const product = await productService.deactivateProduct(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deactivated successfully',
    data: { product },
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deactivateProduct,
};

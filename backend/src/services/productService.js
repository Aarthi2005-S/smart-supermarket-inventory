const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

const getAllProducts = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  const products = await Product.find(filter).sort({ createdAt: -1 });
  return products;
};

const getProductById = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

const getProductByBarcode = async (barcode) => {
  const product = await Product.findOne({ barcode, isActive: true });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

const updateProduct = async (id, updateData) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  Object.assign(product, updateData);
  await product.save();

  return product;
};

const deactivateProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.isActive) {
    throw new AppError('Product is already inactive', 400);
  }

  product.isActive = false;
  await product.save();

  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deactivateProduct,
};

const express = require('express');
const productController = require('../controllers/productController');
const {
  barcodeParamValidation,
  idParamValidation,
  createProductValidation,
  updateProductValidation,
  getAllProductsValidation,
} = require('../middleware/validate');

const router = express.Router();

router.post('/', createProductValidation, productController.createProduct);
router.get('/', getAllProductsValidation, productController.getAllProducts);

// Barcode route must be registered before /:id to avoid route conflicts
router.get(
  '/barcode/:barcode',
  barcodeParamValidation,
  productController.getProductByBarcode
);

router.get('/:id', idParamValidation, productController.getProductById);
router.put(
  '/:id',
  idParamValidation,
  updateProductValidation,
  productController.updateProduct
);
router.delete('/:id', idParamValidation, productController.deactivateProduct);

module.exports = router;

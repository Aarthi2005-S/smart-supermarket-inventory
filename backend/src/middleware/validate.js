const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join(', ');

    return next(new AppError(message, 400));
  }

  next();
};

const barcodeParamValidation = [
  param('barcode')
    .trim()
    .notEmpty()
    .withMessage('Barcode is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Barcode must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Barcode can only contain letters, numbers, and hyphens'),
  handleValidationErrors,
];

const idParamValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  handleValidationErrors,
];

const createProductValidation = [
  body('barcode')
    .trim()
    .notEmpty()
    .withMessage('Barcode is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Barcode must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Barcode can only contain letters, numbers, and hyphens'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  body('brand')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),
  body('unit')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unit cannot exceed 50 characters'),
  body('image')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Image URL cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

const updateProductValidation = [
  body('barcode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Barcode cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Barcode must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Barcode can only contain letters, numbers, and hyphens'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  body('brand')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),
  body('unit')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unit cannot exceed 50 characters'),
  body('image')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Image URL cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

const getAllProductsValidation = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeInactive must be true or false'),
  handleValidationErrors,
];

module.exports = {
  barcodeParamValidation,
  idParamValidation,
  createProductValidation,
  updateProductValidation,
  getAllProductsValidation,
};

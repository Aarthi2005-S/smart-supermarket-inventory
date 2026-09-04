const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be greater than 0']
    },
    manufacturingDate: {
      type: Date,
      required: [true, 'Manufacturing date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized query execution
batchSchema.index({ product: 1 });
batchSchema.index({ batchNumber: 1 });
batchSchema.index({ expiryDate: 1 });

// Helper to validate date logic
function validateDates(mfgDate, expDate) {
  if (new Date(expDate) <= new Date(mfgDate)) {
    throw new Error('Expiry date must be after manufacturing date');
  }
}

// Pre-save validation
batchSchema.pre('save', function (next) {
  try {
    validateDates(this.manufacturingDate, this.expiryDate);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-update validation for findOneAndUpdate / findByIdAndUpdate
batchSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const mfg = update.manufacturingDate || (update.$set && update.$set.manufacturingDate);
  const exp = update.expiryDate || (update.$set && update.$set.expiryDate);

  if (mfg && exp) {
    try {
      validateDates(mfg, exp);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Batch', batchSchema);
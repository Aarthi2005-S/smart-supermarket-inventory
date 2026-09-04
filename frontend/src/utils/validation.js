const BARCODE_PATTERN = /^[a-zA-Z0-9-]+$/;

export const trimFormValues = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ])
  );

export const validateProductForm = (values, { requireAll = true } = {}) => {
  const errors = {};
  const barcode = values.barcode?.trim() || '';
  const name = values.name?.trim() || '';
  const category = values.category?.trim() || '';
  const unit = values.unit?.trim() || '';

  if (requireAll || values.barcode !== undefined) {
    if (!barcode) {
      errors.barcode = 'Barcode is required';
    } else if (!BARCODE_PATTERN.test(barcode)) {
      errors.barcode = 'Barcode can only contain letters, numbers, and hyphens';
    } else if (barcode.length > 50) {
      errors.barcode = 'Barcode cannot exceed 50 characters';
    }
  }

  if (requireAll || values.name !== undefined) {
    if (!name) {
      errors.name = 'Product name is required';
    } else if (name.length > 200) {
      errors.name = 'Product name cannot exceed 200 characters';
    }
  }

  if (requireAll || values.category !== undefined) {
    if (!category) {
      errors.category = 'Category is required';
    } else if (category.length > 100) {
      errors.category = 'Category cannot exceed 100 characters';
    }
  }

  if (requireAll || values.unit !== undefined) {
    if (!unit) {
      errors.unit = 'Unit is required';
    } else if (unit.length > 50) {
      errors.unit = 'Unit cannot exceed 50 characters';
    }
  }

  if (values.brand?.trim().length > 100) {
    errors.brand = 'Brand cannot exceed 100 characters';
  }

  if (values.image?.trim().length > 500) {
    errors.image = 'Image URL cannot exceed 500 characters';
  }

  return errors;
};

export const validateBarcode = (barcode) => {
  const trimmed = barcode?.trim() || '';

  if (!trimmed) {
    return 'Please enter a barcode';
  }

  if (!BARCODE_PATTERN.test(trimmed)) {
    return 'Barcode can only contain letters, numbers, and hyphens';
  }

  if (trimmed.length > 50) {
    return 'Barcode cannot exceed 50 characters';
  }

  return null;
};

export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (error.isNetworkError || error.status === 0) {
    return 'Unable to connect to the server. Please ensure the backend is running.';
  }

  if (error.status === 404) {
    return error.message || 'Product not found';
  }

  if (error.status === 409) {
    return 'A product with this barcode already exists.';
  }

  if (error.status === 400) {
    return error.message || 'Invalid input. Please check your data.';
  }

  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return error.message || 'Something went wrong. Please try again.';
};

export const formatDate = (dateString) => {
  if (!dateString) {
    return '—';
  }

  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

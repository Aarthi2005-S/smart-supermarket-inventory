import { useState } from 'react';
import { trimFormValues, validateProductForm } from '../utils/validation';

const defaultValues = {
  barcode: '',
  name: '',
  brand: '',
  category: '',
  unit: '',
  image: '',
  isActive: true,
};

function ProductForm({
  initialValues = defaultValues,
  onSubmit,
  submitLabel = 'Save Product',
  isSubmitting = false,
  serverError = '',
}) {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = trimFormValues(values);
    const validationErrors = validateProductForm(trimmed);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(trimmed);
  };

  const fields = [
    { name: 'barcode', label: 'Barcode', required: true, placeholder: '8901234567890' },
    { name: 'name', label: 'Product Name', required: true, placeholder: 'Milk 500ml' },
    { name: 'brand', label: 'Brand', placeholder: 'Aavin' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Dairy' },
    { name: 'unit', label: 'Unit', required: true, placeholder: 'Packet' },
    { name: 'image', label: 'Image URL', placeholder: 'https://example.com/image.jpg' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            id={field.name}
            name={field.name}
            type="text"
            value={values[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={[
              'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
              errors[field.name]
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
            ].join(' ')}
          />
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={values.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
          Active product
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default ProductForm;

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../services/productApi';
import { getFriendlyErrorMessage } from '../utils/validation';

function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const prefilledBarcode = searchParams.get('barcode') || '';

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      await createProduct(formData);
      setSuccessMessage('Product created successfully. Redirecting...');
      setTimeout(() => navigate('/products'), 1200);
    } catch (error) {
      setServerError(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/products" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          ← Back to Products
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register a new product in the supermarket inventory.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <ProductForm
          initialValues={{ barcode: prefilledBarcode }}
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          isSubmitting={isSubmitting}
          serverError={serverError}
        />
      </div>
    </div>
  );
}

export default AddProduct;

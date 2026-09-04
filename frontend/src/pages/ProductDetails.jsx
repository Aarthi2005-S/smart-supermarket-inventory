import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getProductById, updateProduct } from '../services/productApi';
import { formatDate, getFriendlyErrorMessage } from '../utils/validation';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const updated = await updateProduct(id, formData);
      setProduct(updated);
      setIsEditing(false);
      setSuccessMessage('Product updated successfully.');
    } catch (err) {
      setServerError(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading product details..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <Link to="/products" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          ← Back to Products
        </Link>
        <div className="mt-4">
          <ErrorMessage message={error} onRetry={fetchProduct} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/products" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            ← Back to Products
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{product.barcode}</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setSuccessMessage('');
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Product
          </button>
        )}
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Edit Product</h2>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setServerError('');
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
          <ProductForm
            initialValues={product}
            onSubmit={handleUpdate}
            submitLabel="Update Product"
            isSubmitting={isSubmitting}
            serverError={serverError}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {product.image && (
            <div className="border-b border-slate-100 bg-slate-50 p-4">
              <img
                src={product.image}
                alt={product.name}
                className="mx-auto max-h-48 rounded-lg object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <dl className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <DetailItem label="Product Name" value={product.name} />
            <DetailItem label="Barcode" value={product.barcode} mono />
            <DetailItem label="Brand" value={product.brand || '—'} />
            <DetailItem label="Category" value={product.category} />
            <DetailItem label="Unit" value={product.unit || '—'} />
            <DetailItem
              label="Active Status"
              value={product.isActive ? 'Active' : 'Inactive'}
            />
            <DetailItem label="Created Date" value={formatDate(product.createdAt)} />
            <DetailItem label="Updated Date" value={formatDate(product.updatedAt)} />
          </dl>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-slate-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

export default ProductDetails;

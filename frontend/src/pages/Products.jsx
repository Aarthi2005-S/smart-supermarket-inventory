import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getProducts } from '../services/productApi';
import { getFriendlyErrorMessage } from '../utils/validation';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProducts(true);
      setProducts(data);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(nameSearch.trim().toLowerCase());
    const matchesBarcode = product.barcode
      .toLowerCase()
      .includes(barcodeSearch.trim().toLowerCase());
    return matchesName && matchesBarcode;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage supermarket product records and view active status.
          </p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Add Product
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={nameSearch}
          onChange={(event) => setNameSearch(event.target.value)}
          placeholder="Search by product name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <input
          type="text"
          value={barcodeSearch}
          onChange={(event) => setBarcodeSearch(event.target.value)}
          placeholder="Search by barcode"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {loading && <Loading message="Loading products..." />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchProducts} />
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-800">No products found</h3>
          <p className="mt-2 text-sm text-slate-600">
            {products.length === 0
              ? 'Start by adding your first product.'
              : 'Try adjusting your search filters.'}
          </p>
          {products.length === 0 && (
            <Link
              to="/products/add"
              className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Add Product
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;

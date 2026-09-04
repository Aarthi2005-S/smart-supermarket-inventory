import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 font-mono text-sm text-slate-500">{product.barcode}</p>
        </div>
        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            product.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-slate-500">Brand</dt>
          <dd className="font-medium text-slate-800">{product.brand || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Category</dt>
          <dd className="font-medium text-slate-800">{product.category}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Unit</dt>
          <dd className="font-medium text-slate-800">{product.unit || '—'}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <Link
          to={`/products/${product._id}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          View / Edit →
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getAllBatches } from '../services/batchApi';
import { getFriendlyErrorMessage } from '../utils/validation';

const EXPIRING_SOON_LIMIT = 7;

function Dashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllBatches();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const getStatus = (expiryDate) => {
    if (!expiryDate) {
      return 'Active';
    }

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return 'Expired';
    }

    if (daysRemaining <= EXPIRING_SOON_LIMIT) {
      return 'Expiring Soon';
    }

    return 'Active';
  };

  const getDaysDifference = (expiryDate) => {
    if (!expiryDate) {
      return null;
    }

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const totals = useMemo(() => {
    const summary = {
      totalProducts: new Set(inventory.map((item) => item?.product?._id).filter(Boolean)).size,
      totalStock: inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalBatches: inventory.length,
      activeStock: 0,
      expiringSoon: 0,
      expiredStock: 0,
    };

    inventory.forEach((item) => {
      const status = getStatus(item.expiryDate);
      const quantity = Number(item.quantity || 0);

      if (status === 'Active') summary.activeStock += quantity;
      if (status === 'Expiring Soon') summary.expiringSoon += quantity;
      if (status === 'Expired') summary.expiredStock += quantity;
    });

    return summary;
  }, [inventory, today]);

  const alerts = useMemo(() => {
    return [...inventory]
      .filter((item) => {
        const status = getStatus(item.expiryDate);
        return status === 'Expired' || status === 'Expiring Soon';
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [inventory, today]);

  const goToInventoryWithFilter = (status) => {
    navigate(`/inventory?status=${encodeURIComponent(status)}`);
  };

  return (
    <div className="page-shell space-y-6">
      <div className="rounded-[28px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white shadow-[0_22px_52px_rgba(16,185,129,0.28)] sm:p-8 animate-fadeIn">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Smart Supermarket</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Inventory Management</h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
              Real-time stock visibility, expiry tracking, and operational alerts across every batch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={loadInventory} className="secondary-button border-white/40 bg-white/10 px-5 text-white hover:bg-white/15">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="loading-shimmer h-36 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorMessage title="Dashboard unavailable" message={error} onRetry={loadInventory} />
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Products" value={totals.totalProducts} icon="◫" accent="emerald" />
            <StatCard title="Total Stock" value={totals.totalStock} icon="▣" accent="teal" />
            <StatCard title="Expiring Soon" value={totals.expiringSoon} icon="⚠" accent="amber" clickable onClick={() => goToInventoryWithFilter('Expiring Soon')} />
            <StatCard title="Expired" value={totals.expiredStock} icon="⏰" accent="red" clickable onClick={() => goToInventoryWithFilter('Expired')} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="card-surface p-5 sm:p-6 animate-slideUp">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="section-title">Expiry Alerts</h2>
                  <p className="section-subtitle">Critical batches requiring attention</p>
                </div>
              </div>

              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No expiring or expired items.
                </div>
              ) : (
                <div className="space-y-4">
                  <AlertList
                    title="Expired products"
                    items={alerts.filter((item) => getStatus(item.expiryDate) === 'Expired')}
                    kind="expired"
                  />
                  <AlertList
                    title="Products expiring within 7 days"
                    items={alerts.filter((item) => getStatus(item.expiryDate) === 'Expiring Soon')}
                    kind="expiring"
                  />
                </div>
              )}
            </section>

            <div className="space-y-4 animate-slideUp">
              <div className="card-surface p-5">
                <h3 className="section-title">Quick actions</h3>
                <div className="mt-4 space-y-3">
                  <button type="button" onClick={() => navigate('/receive-stock')} className="primary-button w-full px-4">
                    Receive Stock
                  </button>
                  <button type="button" onClick={() => navigate('/products/add')} className="secondary-button w-full px-4">
                    Add Product
                  </button>
                  <button type="button" onClick={() => navigate('/inventory')} className="secondary-button w-full px-4">
                    View Inventory
                  </button>
                </div>
              </div>

              <div className="card-surface p-5">
                <h3 className="section-title">Status summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
                    <span>Active</span>
                    <strong>{totals.activeStock}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
                    <span>Expiring soon</span>
                    <strong>{totals.expiringSoon}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 text-red-800">
                    <span>Expired</span>
                    <strong>{totals.expiredStock}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="card-surface p-5 sm:p-6 animate-slideUp">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Inventory Overview</h2>
                <p className="section-subtitle">Latest batch health across the store</p>
              </div>
              <button type="button" onClick={loadInventory} className="secondary-button px-4">
                Refresh
              </button>
            </div>

            {inventory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No batch inventory found.
              </div>
            ) : (
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Batch</th>
                      <th>Qty</th>
                      <th>Manufacturing</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const status = getStatus(item.expiryDate);
                      return (
                        <tr key={item._id}>
                          <td className="font-semibold text-slate-800">{item.product?.name || '—'}</td>
                          <td className="font-mono text-slate-600">{item.product?.barcode || '—'}</td>
                          <td className="text-slate-700">{item.batchNumber || '—'}</td>
                          <td className="font-semibold text-slate-900">{item.quantity ?? 0}</td>
                          <td className="text-slate-600">{formatDate(item.manufacturingDate)}</td>
                          <td className="text-slate-600">{formatDate(item.expiryDate)}</td>
                          <td><StatusBadge status={status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, accent, clickable = false, onClick }) {
  const accentMap = {
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <button type="button" onClick={onClick} disabled={!clickable} className={`stat-card w-full text-left ${clickable ? 'cursor-pointer' : 'cursor-default'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`${accentMap[accent] ?? 'bg-emerald-500'} stat-card__icon`}>{icon}</div>
      </div>
      <span className="stat-card__label">{title}</span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__meta">{clickable ? 'View all' : 'Live data'}</span>
    </button>
  );
}

function AlertList({ title, items, kind }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-600">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            No {kind === 'expired' ? 'expired' : 'expiring soon'} items.
          </div>
        ) : (
          items.map((item) => {
            const daysDifference = getDaysDifference(item.expiryDate);
            const status = kind === 'expired' ? 'Expired' : 'Expiring Soon';
            const label =
              status === 'Expired'
                ? `${Math.abs(daysDifference)} day${Math.abs(daysDifference) === 1 ? '' : 's'} overdue`
                : `${daysDifference} day${daysDifference === 1 ? '' : 's'} remaining`;

            return (
              <div key={`${item._id}-${status}`} className={`alert-card ${kind === 'expired' ? 'alert-card--expired' : 'alert-card--expiring'} animate-fadeIn`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.product?.name || 'Unknown product'}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.product?.barcode || '—'} • {item.batchNumber || '—'}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>Qty: {item.quantity ?? 0}</span>
                  <span>Expiry: {formatDate(item.expiryDate)}</span>
                  <span className="font-semibold text-slate-700">{label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'Expired') return <span className="status-badge status-badge--expired">Expired</span>;
  if (status === 'Expiring Soon') return <span className="status-badge status-badge--expiring">Expiring Soon</span>;
  return <span className="status-badge status-badge--active">Active</span>;
}

function getDaysDifference(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateValue) {
  if (!dateValue) return '—';
  return new Date(dateValue).toLocaleDateString('en-IN');
}

export default Dashboard;
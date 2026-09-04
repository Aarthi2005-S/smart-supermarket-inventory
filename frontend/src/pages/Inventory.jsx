import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deleteBatch, getAllBatches, updateBatch } from '../services/batchApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getFriendlyErrorMessage } from '../utils/validation';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const FILTER_OPTIONS = ['All', 'Active', 'Expiring Soon', 'Expired'];

function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchNumber: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const statusFromQuery = searchParams.get('status');
    const validFilters = ['All', 'Active', 'Expiring Soon', 'Expired'];

    if (statusFromQuery && validFilters.includes(statusFromQuery)) {
      setStatusFilter(statusFromQuery);
    } else if (!statusFromQuery) {
      setStatusFilter('All');
    }
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (statusFilter === 'All') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', statusFilter);
    }

    setSearchParams(nextParams, { replace: true });
  }, [statusFilter]);

  const today = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }, []);

  const getStatus = (expiryDate) => {
    if (!expiryDate) {
      return 'Active';
    }

    const expiry = new Date(expiryDate);
    const expiryDay = new Date(expiry);
    expiryDay.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil((expiryDay - today) / ONE_DAY_MS);

    if (daysRemaining < 0) {
      return 'Expired';
    }

    if (daysRemaining <= 7) {
      return 'Expiring Soon';
    }

    return 'Active';
  };

  const filteredInventory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return inventory.filter((batch) => {
      const product = batch?.product || {};
      const productName = (product.name || '').toLowerCase();
      const barcode = (product.barcode || '').toLowerCase();
      const batchNumber = (batch.batchNumber || '').toLowerCase();
      const matchesSearch =
        !query ||
        productName.includes(query) ||
        barcode.includes(query) ||
        batchNumber.includes(query);

      const currentStatus = getStatus(batch.expiryDate);
      const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, statusFilter, today]);

  const totals = useMemo(() => {
    const summary = {
      totalBatches: inventory.length,
      totalStock: inventory.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0),
      activeStock: 0,
      expiringSoon: 0,
      expired: 0,
    };

    inventory.forEach((batch) => {
      const status = getStatus(batch.expiryDate);

      if (status === 'Active') {
        summary.activeStock += Number(batch.quantity || 0);
      }

      if (status === 'Expiring Soon') {
        summary.expiringSoon += Number(batch.quantity || 0);
      }

      if (status === 'Expired') {
        summary.expired += Number(batch.quantity || 0);
      }
    });

    return summary;
  }, [inventory, today]);

  const openEditModal = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      batchNumber: batch?.batchNumber || '',
      quantity: batch?.quantity || '',
      manufacturingDate: toDateInputValue(batch?.manufacturingDate),
      expiryDate: toDateInputValue(batch?.expiryDate),
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedBatch(null);
    setFormData({
      batchNumber: '',
      quantity: '',
      manufacturingDate: '',
      expiryDate: '',
    });
    setFormError('');
    setIsEditModalOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateBatch = async (event) => {
    event.preventDefault();

    if (!selectedBatch) {
      return;
    }

    const batchNumber = formData.batchNumber.trim();
    const quantity = Number(formData.quantity);
    const manufacturingDate = formData.manufacturingDate;
    const expiryDate = formData.expiryDate;

    if (!batchNumber) {
      setFormError('Batch number is required.');
      return;
    }

    if (!manufacturingDate || !expiryDate) {
      setFormError('Manufacturing date and expiry date are required.');
      return;
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      setFormError('Expiry date must be after the manufacturing date.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      await updateBatch(selectedBatch._id, {
        batchNumber,
        quantity,
        manufacturingDate,
        expiryDate,
      });

      setSuccessMessage('Batch updated successfully.');
      closeEditModal();
      await loadInventory();
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      setError('');
      await deleteBatch(batchId);
      setSuccessMessage('Batch deleted successfully.');
      await loadInventory();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="page-shell space-y-6">
      <div className="rounded-[26px] bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-800 p-6 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Store operations</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Inventory Management</h1>
            <p className="mt-2 text-sm text-emerald-50/90">
              Manage supermarket stock, batches and expiry information.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInventory}
            className="secondary-button border-white/30 bg-white/10 px-5 text-white hover:bg-white/15"
          >
            Refresh Inventory
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Batches" value={totals.totalBatches} />
        <StatCard title="Total Stock Quantity" value={totals.totalStock} />
        <StatCard title="Active Stock" value={totals.activeStock} />
        <StatCard title="Expiring Soon" value={totals.expiringSoon} />
        <StatCard title="Expired" value={totals.expired} />
      </div>

      <div className="card-surface p-4 sm:p-5 animate-slideUp">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full gap-3 md:grid-cols-2 xl:w-2/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by product name, barcode or batch number"
            className="field-input"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            className="field-input"
            >
              {FILTER_OPTIONS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 animate-fadeIn">
          {successMessage}
        </div>
      )}

      {loading && <Loading message="Loading inventory..." />}

      {!loading && error && <ErrorMessage title="Inventory unavailable" message={error} onRetry={loadInventory} />}

      {!loading && !error && filteredInventory.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-base font-medium text-slate-800">No inventory items found.</p>
        </div>
      )}

      {!loading && !error && filteredInventory.length > 0 && (
        <div className="table-shell animate-slideUp">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Barcode</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Batch Number</th>
                  <th>Quantity</th>
                  <th>Manufacturing Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((batch) => {
                  const product = batch?.product || {};
                  const status = getStatus(batch.expiryDate);

                  return (
                    <tr key={batch._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{product.name || 'Unknown product'}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{product.barcode || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{product.brand || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{product.category || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{batch.batchNumber || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{batch.quantity ?? 0}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(batch.manufacturingDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(batch.expiryDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(batch)}
                            className="secondary-button px-2.5 py-1.5 text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBatch(batch._id)}
                            className="danger-button px-2.5 py-1.5 text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Batch</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-lg font-semibold text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateBatch} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Batch Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  className="field-input"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="field-input"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Manufacturing Date</label>
                  <input
                    type="date"
                    name="manufacturingDate"
                    value={formData.manufacturingDate}
                    onChange={handleInputChange}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="field-input"
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="secondary-button px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="primary-button px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  let className = 'bg-emerald-100 text-emerald-700';

  if (status === 'Expired') {
    className = 'bg-red-100 text-red-700';
  } else if (status === 'Expiring Soon') {
    className = 'bg-amber-100 text-amber-700';
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '—';
  }

  return new Date(dateValue).toLocaleDateString('en-IN');
}

function toDateInputValue(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export default Inventory;
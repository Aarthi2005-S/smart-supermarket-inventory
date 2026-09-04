import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import Loading from '../components/Loading';
import { getProductByBarcode } from '../services/productApi';
import { createBatch } from '../services/batchApi';
import { getFriendlyErrorMessage, validateBarcode } from '../utils/validation';

const LOOKUP_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
};

function ReceiveStock() {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [lookupState, setLookupState] = useState(LOOKUP_STATES.IDLE);
  const [product, setProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showStage2, setShowStage2] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  // Stage 2 form
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchError, setBatchError] = useState('');
  const [batchSuccess, setBatchSuccess] = useState('');
  const [savingBatch, setSavingBatch] = useState(false);

  const lookupProduct = useCallback(async (barcode) => {
    const trimmed = barcode.trim();
    const validation = validateBarcode(trimmed);

    if (validation) {
      setValidationError(validation);
      setLookupState(LOOKUP_STATES.ERROR);
      setErrorMessage(validation);
      return;
    }

    setValidationError('');
    setScannedBarcode(trimmed);
    setLookupState(LOOKUP_STATES.LOADING);
    setErrorMessage('');
    setProduct(null);
    setShowStage2(false);
    setBatchError('');
    setBatchSuccess('');

    try {
      const result = await getProductByBarcode(trimmed);
      setProduct(result);
      setLookupState(LOOKUP_STATES.FOUND);
    } catch (error) {
      if (error.status === 404) {
        setLookupState(LOOKUP_STATES.NOT_FOUND);
      } else {
        setLookupState(LOOKUP_STATES.ERROR);
        setErrorMessage(getFriendlyErrorMessage(error));
      }
    }
  }, []);

  const handleScan = useCallback(
    (barcode) => {
      setManualBarcode(barcode);
      lookupProduct(barcode);
    },
    [lookupProduct]
  );

  const handleManualSearch = (event) => {
    event.preventDefault();
    lookupProduct(manualBarcode);
  };

  const handleContinue = () => {
    setShowStage2(true);
    setBatchError('');
    setBatchSuccess('');
  };

  const handleCreateBatch = async (event) => {
    event.preventDefault();

    setBatchError('');
    setBatchSuccess('');

    // Validate fields
    if (
      !batchNumber.trim() ||
      !quantity ||
      !manufacturingDate ||
      !expiryDate
    ) {
      setBatchError('Please fill in all batch fields.');
      return;
    }

    if (Number(quantity) <= 0) {
      setBatchError('Quantity must be greater than 0.');
      return;
    }

    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      setBatchError('Expiry date must be after manufacturing date.');
      return;
    }

    try {
      setSavingBatch(true);

      const batchData = {
        product: product._id,
        batchNumber: batchNumber.trim(),
        quantity: Number(quantity),
        manufacturingDate,
        expiryDate,
      };

      await createBatch(batchData);

      setBatchSuccess('Stock received successfully! Batch has been saved.');

      // Clear batch form
      setBatchNumber('');
      setQuantity('');
      setManufacturingDate('');
      setExpiryDate('');
    } catch (error) {
      setBatchError(
        error.message || 'Unable to save batch. Please try again.'
      );
    } finally {
      setSavingBatch(false);
    }
  };

  const handleReset = () => {
    setManualBarcode('');
    setScannedBarcode('');
    setProduct(null);
    setErrorMessage('');
    setValidationError('');
    setShowStage2(false);

    setBatchNumber('');
    setQuantity('');
    setManufacturingDate('');
    setExpiryDate('');
    setBatchError('');
    setBatchSuccess('');
    setSavingBatch(false);

    setLookupState(LOOKUP_STATES.IDLE);
    setScannerKey((prev) => prev + 1);
  };

  const scannerDisabled =
    lookupState === LOOKUP_STATES.LOADING ||
    lookupState === LOOKUP_STATES.FOUND;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Receive Stock
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Scan a product barcode to identify it before receiving stock.
        </p>
      </div>

      {/* STAGE 1 */}
      {!showStage2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-center text-lg font-semibold text-slate-900">
            Scan Product
          </h2>

          <div className="mt-6 space-y-6">
            <BarcodeScanner
              key={scannerKey}
              onScan={handleScan}
              disabled={scannerDisabled}
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <label
                htmlFor="manualBarcode"
                className="block text-sm font-medium text-slate-700"
              >
                Enter Barcode Manually
              </label>

              <input
                id="manualBarcode"
                type="text"
                value={manualBarcode}
                onChange={(event) => {
                  setManualBarcode(event.target.value);
                  setValidationError('');
                }}
                placeholder="8901234567890"
                className={[
                  'w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none',
                  validationError
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
                ].join(' ')}
              />

              {validationError && (
                <p className="text-sm text-red-600">
                  {validationError}
                </p>
              )}

              <button
                type="submit"
                disabled={lookupState === LOOKUP_STATES.LOADING}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Search Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCANNED BARCODE */}
      {scannedBarcode && lookupState !== LOOKUP_STATES.IDLE && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Scanned Barcode
          </p>

          <p className="mt-1 font-mono text-sm text-slate-900">
            {scannedBarcode}
          </p>
        </div>
      )}

      {/* LOADING */}
      {lookupState === LOOKUP_STATES.LOADING && (
        <Loading message="Searching for product..." />
      )}

      {/* PRODUCT FOUND */}
      {lookupState === LOOKUP_STATES.FOUND && product && !showStage2 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
              ✓
            </span>

            <h3 className="text-lg font-semibold text-emerald-900">
              Product Found
            </h3>
          </div>

          <div className="mt-4 space-y-3 rounded-lg bg-white p-4">
            <p className="text-xl font-bold text-slate-900">
              {product.name}
            </p>

            <ResultRow
              label="Brand"
              value={product.brand || '—'}
            />

            <ResultRow
              label="Category"
              value={product.category}
            />

            <ResultRow
              label="Unit"
              value={product.unit || '—'}
            />

            <ResultRow
              label="Barcode"
              value={product.barcode}
              mono
            />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
          >
            Continue →
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 block text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Scan another product
          </button>
        </div>
      )}

      {/* STAGE 2 */}
      {showStage2 && product && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Stage 2
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Receive Stock
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Enter batch and expiry information for this product.
            </p>
          </div>

          {/* Product information */}
          <div className="mt-5 rounded-lg bg-white p-4">
            <p className="text-lg font-bold text-slate-900">
              {product.name}
            </p>

            <div className="mt-2">
              <ResultRow
                label="Barcode"
                value={product.barcode}
                mono
              />

              <ResultRow
                label="Category"
                value={product.category}
              />
            </div>
          </div>

          {/* Batch form */}
          <form
            onSubmit={handleCreateBatch}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="batchNumber"
                className="block text-sm font-medium text-slate-700"
              >
                Batch Number
              </label>

              <input
                id="batchNumber"
                type="text"
                value={batchNumber}
                onChange={(event) =>
                  setBatchNumber(event.target.value)
                }
                placeholder="Example: MILK-BATCH-001"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-700"
              >
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                placeholder="Example: 50"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="manufacturingDate"
                className="block text-sm font-medium text-slate-700"
              >
                Manufacturing Date
              </label>

              <input
                id="manufacturingDate"
                type="date"
                value={manufacturingDate}
                onChange={(event) =>
                  setManufacturingDate(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-slate-700"
              >
                Expiry Date
              </label>

              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(event) =>
                  setExpiryDate(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {batchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {batchError}
              </div>
            )}

            {/* Success */}
            {batchSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                ✓ {batchSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={savingBatch}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingBatch
                ? 'Saving Stock...'
                : 'Receive Stock'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 block text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            ← Scan another product
          </button>
        </div>
      )}

      {/* PRODUCT NOT FOUND */}
      {lookupState === LOOKUP_STATES.NOT_FOUND && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-amber-900">
            Product Not Found
          </h3>

          <p className="mt-2 text-sm text-amber-800">
            Barcode:{' '}
            <span className="font-mono font-medium">
              {scannedBarcode}
            </span>
          </p>

          <p className="mt-2 text-sm text-amber-800">
            This product is not registered.
          </p>

          <Link
            to={`/products/add?barcode=${encodeURIComponent(
              scannedBarcode
            )}`}
            className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Add New Product
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 block text-sm font-medium text-amber-800 hover:text-amber-900"
          >
            Try another barcode
          </button>
        </div>
      )}

      {/* ERROR */}
      {lookupState === LOOKUP_STATES.ERROR && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-red-800">
            Lookup Error
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-24 shrink-0 text-sm text-slate-500">
        {label}:
      </dt>

      <dd
        className={`text-sm font-medium text-slate-900 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default ReceiveStock;
function ErrorMessage({ title = 'Error', message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-6">
      <h3 className="text-base font-semibold text-red-800">{title}</h3>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;

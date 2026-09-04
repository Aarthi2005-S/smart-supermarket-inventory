import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const SCANNER_ELEMENT_ID = 'barcode-scanner-region';

function BarcodeScanner({ onScan, disabled = false }) {
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [statusMessage, setStatusMessage] = useState('');
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ barcode: '', time: 0 });
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    let isMounted = true;

    const handleScanSuccess = (decodedText) => {
      const barcode = decodedText.trim();
      const now = Date.now();

      if (
        !barcode ||
        (lastScanRef.current.barcode === barcode && now - lastScanRef.current.time < 3000)
      ) {
        return;
      }

      lastScanRef.current = { barcode, time: now };
      onScanRef.current(barcode);
    };

    const initScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setCameraStatus('unavailable');
          setStatusMessage(
            'Camera scanning is unavailable. Enter the barcode manually.'
          );
        }
        return;
      }

      try {
        const scanner = new Html5QrcodeScanner(
          SCANNER_ELEMENT_ID,
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            rememberLastUsedCamera: true,
          },
          false
        );

        scannerRef.current = scanner;

        scanner.render(handleScanSuccess, () => {
          // Ignore continuous scan failures while searching for a code.
        });

        if (isMounted) {
          setCameraStatus('ready');
          setStatusMessage('');
        }
      } catch (error) {
        const isPermissionDenied =
          error?.name === 'NotAllowedError' ||
          error?.message?.toLowerCase().includes('permission');

        if (isMounted) {
          setCameraStatus(isPermissionDenied ? 'denied' : 'error');
          setStatusMessage(
            isPermissionDenied
              ? 'Camera permission denied. Enter the barcode manually.'
              : 'Camera scanning is unavailable. Enter the barcode manually.'
          );
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;

      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [disabled]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/50 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Camera Scanner</h3>

      {cameraStatus === 'initializing' && (
        <p className="mt-2 text-sm text-slate-500">Initializing camera...</p>
      )}

      {(cameraStatus === 'unavailable' ||
        cameraStatus === 'error' ||
        cameraStatus === 'denied') && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {statusMessage}
        </div>
      )}

      {!disabled &&
        cameraStatus !== 'unavailable' &&
        cameraStatus !== 'error' &&
        cameraStatus !== 'denied' && (
          <div id={SCANNER_ELEMENT_ID} className="mt-3 overflow-hidden rounded-lg bg-white" />
        )}

      {disabled && cameraStatus === 'ready' && (
        <p className="mt-2 text-sm text-slate-500">
          Scanner paused while product result is displayed.
        </p>
      )}
    </div>
  );
}

export default BarcodeScanner;

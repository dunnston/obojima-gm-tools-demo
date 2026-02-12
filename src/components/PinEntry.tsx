'use client';

import { useState, useRef, useEffect } from 'react';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { NetworkClientAdapter, PinVerifyResponse } from '@/lib/storage/networkClientAdapter';

interface PinEntryProps {
  onAuthenticated: () => void;
  adapter: NetworkClientAdapter;
}

export default function PinEntry({ onAuthenticated, adapter }: PinEntryProps) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    const fullPin = newPin.join('');
    if (fullPin.length >= 4 && newPin.slice(0, fullPin.length).every(d => d)) {
      // Check if we have 4-6 digits and the current position is complete
      const enteredLength = newPin.filter(d => d).length;
      if (enteredLength >= 4) {
        // Small delay to show the last digit
        setTimeout(() => handleSubmit(fullPin.slice(0, enteredLength)), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle Enter to submit
    if (e.key === 'Enter') {
      const fullPin = pin.filter(d => d).join('');
      if (fullPin.length >= 4) {
        handleSubmit(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length >= 4) {
      const newPin = [...pin];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  const handleSubmit = async (pinValue: string) => {
    if (isVerifying) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response: PinVerifyResponse = await adapter.verifyPin(pinValue);

      if (response.success) {
        onAuthenticated();
      } else {
        setError(response.error || 'Invalid PIN. Please try again.');
        // Clear PIN and refocus first input
        setPin(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setPin(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/20 rounded-full mb-4">
              <LockClosedIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Enter PIN</h1>
            <p className="text-slate-400">
              This session is protected. Enter the PIN to continue.
            </p>
          </div>

          {/* PIN Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isVerifying}
                className={`w-12 h-14 text-center text-2xl font-mono bg-slate-700 border-2 rounded-lg
                  focus:outline-none focus:border-emerald-500 transition-colors
                  ${error ? 'border-red-500' : 'border-slate-600'}
                  ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'text-white'}
                `}
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
              <ExclamationCircleIcon className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <div className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}

          {/* Help Text */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Enter the 4-6 digit PIN shown on the host device.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Obojima GM Tools - Network Session
        </p>
      </div>
    </div>
  );
}

'use client';

import CurrencyDisplay, { SimpleCurrencyDisplay } from '@/components/CurrencyDisplay';

export default function CurrencyDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Obojima Currency Demo</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Simple Gold Flower Display:</h2>
          <div className="flex gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">5 Gold Flowers (Small)</p>
              <SimpleCurrencyDisplay goldValue={5} size="sm" />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">10 Gold Flowers (Medium)</p>
              <SimpleCurrencyDisplay goldValue={10} size="md" />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">25 Gold Flowers (Large)</p>
              <SimpleCurrencyDisplay goldValue={25} size="lg" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Full Currency Breakdown:</h2>
          <div className="flex gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">1 Gold Flower (100 copper)</p>
              <CurrencyDisplay goldValue={1} size="md" />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">1.23 Gold Flowers (123 copper)</p>
              <CurrencyDisplay goldValue={1.23} size="md" />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">5.67 Gold Flowers (567 copper)</p>
              <CurrencyDisplay goldValue={5.67} size="md" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Breakdown Examples:</h2>
          <div className="bg-slate-800 p-4 rounded-lg max-w-md">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">1.23 Gold Flowers =</p>
                <p className="text-xs text-slate-500">1 Gold Flower + 2 Sea Petals + 3 Copper Buds</p>
                <CurrencyDisplay goldValue={1.23} size="sm" />
              </div>
              <div>
                <p className="text-sm text-slate-400">0.15 Gold Flowers =</p>
                <p className="text-xs text-slate-500">1 Sea Petal + 5 Copper Buds</p>
                <CurrencyDisplay goldValue={0.15} size="sm" />
              </div>
              <div>
                <p className="text-sm text-slate-400">0.05 Gold Flowers =</p>
                <p className="text-xs text-slate-500">5 Copper Buds</p>
                <CurrencyDisplay goldValue={0.05} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-6">
          <p><strong>Currency System:</strong></p>
          <p>• 1 Gold Flower = 10 Sea Petals = 100 Copper Buds</p>
          <p>• Images automatically fall back to emoji if loading fails</p>
        </div>
      </div>
    </div>
  );
}
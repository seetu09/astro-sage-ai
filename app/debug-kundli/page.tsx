'use client';

import { useState } from 'react';

export default function DebugKundliPage() {
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    latitude: '',
    longitude: '',
    timezone: 'Asia/Kolkata',
  });
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchKundli = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kundali/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          timezoneOffset: 'Asia/Kolkata',
          language: 'en',
          debug: true,
        }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      alert('JSON copied to clipboard!');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Kundli API Debug Tool</h1>
      <p className="text-gray-600 mb-4">Enter birth details to see the raw API response before PDF generation.</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input 
          name="name" 
          placeholder="Full Name" 
          value={form.name} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
        <input 
          name="birthDate" 
          type="date" 
          value={form.birthDate} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
        <input 
          name="birthTime" 
          type="time" 
          value={form.birthTime} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
        <input 
          name="latitude" 
          placeholder="Latitude (e.g., 28.81)" 
          value={form.latitude} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
        <input 
          name="longitude" 
          placeholder="Longitude (e.g., 79.03)" 
          value={form.longitude} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
        <input 
          name="timezone" 
          placeholder="Timezone (e.g., Asia/Kolkata)" 
          value={form.timezone} 
          onChange={handleChange} 
          className="border p-2 rounded"
        />
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={fetchKundli}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Kundli'}
        </button>
        
        {response && (
          <button
            onClick={copyToClipboard}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            📋 Copy JSON
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          ❌ Error: {error}
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">📊 Raw API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-sm border">
            {JSON.stringify(response, null, 2)}
          </pre>

          {/* Quick view sections */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {response.chartData && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">🪐 Chart Data (Planets)</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.chartData, null, 2)}</pre>
              </div>
            )}
            {response.calculations?.vimshottari && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">📅 Vimshottari Dasha</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.calculations.vimshottari, null, 2)}</pre>
              </div>
            )}
            {response.calculations?.yogas && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">✨ Yogas</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.calculations.yogas, null, 2)}</pre>
              </div>
            )}
            {response.calculations?.doshas && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">⚠️ Doshas</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.calculations.doshas, null, 2)}</pre>
              </div>
            )}
            {response.freeTier && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">🎁 Free Tier</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.freeTier, null, 2)}</pre>
              </div>
            )}
            {response.paidTier && (
              <div className="border p-4 rounded">
                <h3 className="font-bold text-lg">💎 Paid Tier</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.paidTier, null, 2)}</pre>
              </div>
            )}
            {response.richPredictions && (
              <div className="border p-4 rounded col-span-2">
                <h3 className="font-bold text-lg">🤖 Rich AI Predictions</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.richPredictions, null, 2)}</pre>
              </div>
            )}
            {response.debugInfo && (
              <div className="border p-4 rounded col-span-2 bg-yellow-50">
                <h3 className="font-bold text-lg">🐛 Debug Info</h3>
                <pre className="text-sm mt-2 max-h-60 overflow-auto">{JSON.stringify(response.debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
          
          {/* Summary Section */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-bold text-green-800">📌 Quick Checks:</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-green-700">
              <li>Check if planetary positions match expected values</li>
              <li>Verify Dasha start/end years are correct</li>
              <li>Confirm Yogas and Doshas are detected properly</li>
              <li>Check AI narrative length - is it detailed or too short?</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
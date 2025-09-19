import React, { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role || !file) return alert('Both Role and Resume are required');

    const formData = new FormData();
    formData.append('role', role);
    formData.append('resume', file);
    formData.append('email', localStorage.getItem('email')); // email automatically from login

    setLoading(true);
    setResult('');

    try {
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.geminiResp);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Upload Your Resume</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <input
              type="text"
              placeholder="Enter the role you're applying for"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Resume (PDF only)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition duration-300'
            }`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="font-bold mb-2 text-gray-800">Gemini Response:</h3>
            <pre className="whitespace-pre-wrap text-gray-700">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

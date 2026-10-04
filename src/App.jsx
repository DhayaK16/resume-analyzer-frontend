import { useState } from 'react';
import Auth from './Auth';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setResult(null);
  };

  if (!token) {
    return <Auth onLogin={(t) => setToken(t)} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF resume.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    let res;
    try {
      res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      const text = await res.text();

      if (!res.ok) {
        try {
          const errJson = JSON.parse(text);
          throw new Error(errJson.error || 'Something went wrong. Please try again.');
        } catch {
          throw new Error('Something went wrong. Please try again.');
        }
      }

      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Analyzer</h1>

      <div className="w-full max-w-xl flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white"
        >
          Log out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-4">
        <div>
          <label className="block mb-2 font-medium">Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border border-gray-700 rounded p-2 bg-gray-800"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="w-full border border-gray-700 rounded p-2 bg-gray-800"
            placeholder="Paste the job description here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded p-3 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </form>

      {error && (
        <div className="w-full max-w-xl mt-4 bg-red-900/30 border border-red-700 text-red-300 rounded p-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="w-full max-w-xl mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-200">Match Score</h2>
              <span className={`text-2xl font-bold ${
                result.matchScore >= 70 ? 'text-green-400' :
                result.matchScore >= 40 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {result.matchScore}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  result.matchScore >= 70 ? 'bg-green-500' :
                  result.matchScore >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
          </div>

          {result.missingKeywords?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-200 mb-3">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-red-900/40 text-red-300 border border-red-700 px-3 py-1 rounded-full text-sm"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.strengths?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-green-400">✓</span> Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="bg-green-900/20 border border-green-800 rounded p-3 text-gray-300 text-sm">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improvements?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-yellow-400">→</span> Suggested Improvements
              </h3>
              <ul className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="bg-yellow-900/20 border border-yellow-800 rounded p-3 text-gray-300 text-sm">
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
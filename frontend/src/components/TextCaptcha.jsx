import { useState, useCallback, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const CHALLENGES = [
  () => { const a = rand(2,9), b = rand(2,9); return { q: `What is ${a} + ${b}?`, a: String(a + b) }; },
  () => { const a = rand(10,20), b = rand(1,9); return { q: `What is ${a} - ${b}?`, a: String(a - b) }; },
  () => { const a = rand(2,9), b = rand(2,5); return { q: `What is ${a} × ${b}?`, a: String(a * b) }; },
  () => { const words = ['upload','verify','student','merit','school','data','record','submit'];
          const w = words[rand(0, words.length - 1)];
          return { q: `Type the word: ${w.toUpperCase()}`, a: w }; },
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function TextCaptcha({ onVerified, className = '' }) {
  const [challenge, setChallenge] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const generate = useCallback(() => {
    const gen = CHALLENGES[rand(0, CHALLENGES.length - 1)];
    setChallenge(gen());
    setInput('');
    setError('');
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const verify = (e) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === challenge.a.toLowerCase()) {
      onVerified(true);
    } else {
      setError('Incorrect answer. Try again.');
      generate();
    }
  };

  if (!challenge) return null;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-primary-600" />
        <span className="text-sm font-medium text-gray-700">Human Verification</span>
      </div>
      <form onSubmit={verify} className="space-y-2">
        <p className="text-sm text-gray-800 font-medium">{challenge.q}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your answer"
            autoComplete="off"
          />
          <button type="button" onClick={generate} className="p-2 text-gray-400 hover:text-gray-600" title="New challenge">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={!input.trim()}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
          Verify
        </button>
      </form>
    </div>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Retrieve publishable key from environment variables safely
const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;

const isValidClerkKey = typeof PUBLISHABLE_KEY === 'string' && 
  (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

function ClerkConfigErrorScreen() {
  return (
    <div className="min-h-screen bg-[#FEF9C3] flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-xl w-full p-8 border-4 border-black bg-white shadow-[8px_8px_0_0_#000] space-y-6">
        <div className="inline-block bg-[#FF4D4F] text-white px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider rotate-[-1deg]">
          Configuration Required
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-left">Setup Clerk Authentication</h2>
        <p className="text-sm font-semibold leading-relaxed opacity-85 text-left">
          The application requires a valid Clerk Publishable Key in your <span className="font-mono bg-yellow-100 p-0.5 border border-black/25 rounded">.env</span> file to initialize properly. Currently, your <span className="font-mono bg-yellow-100 p-0.5 border border-black/25">.env</span> file is empty or missing this key.
        </p>
        
        <div className="p-5 border-2 border-black bg-[#E0F2FE] space-y-3 text-left">
          <p className="text-xs font-black uppercase">How to resolve this:</p>
          <ol className="list-decimal pl-4 text-xs font-bold space-y-2">
            <li>Go to your <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="underline text-[#6D5EF9]">Clerk Dashboard</a>.</li>
            <li>Copy your <strong>Publishable Key</strong> (starts with <code className="font-mono bg-white px-1">pk_test_</code>).</li>
            <li>Open the <code className="font-mono bg-white px-1">.env</code> file in your editor and add:
              <pre className="mt-1.5 p-2 bg-black text-green-400 font-mono text-[10px] overflow-x-auto border border-black rounded">
                VITE_CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY"
              </pre>
            </li>
            <li>Restart the development server (<code className="font-mono">npm run dev</code>).</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 px-5 py-3 border-2 border-black bg-[#FFD400] text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isValidClerkKey ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <ClerkConfigErrorScreen />
    )}
  </StrictMode>,
);

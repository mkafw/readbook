// src/pages/Reader.tsx
import { useState } from 'react';
import { Reader, ReaderProvider } from '@epubjs-react/core';

export default function ReaderPage() {
  const [url, setUrl] = useState<string>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="glass rounded-3xl p-6 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">苹果毛玻璃阅读器</h1>
        
        <input
          type="file"
          accept=".epub"
          onChange={e => e.target.files?.[0] && setUrl(URL.createObjectURL(e.target.files[0]))}
          className="w-full file:mr-4 file:py-3 file:px-8 file:rounded-full file:bg-white/30 file:text-white file:border-0 backdrop-blur-xl"
        />

        {url && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-white/20">
            <ReaderProvider height="75vh">
              <Reader url={url} />
            </ReaderProvider>
          </div>
        )}
      </div>
    </div>
  );
}

// 加毛玻璃样式
const style = document.createElement('style');
style.textContent = `
.glass {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.2);
}
`;
document.head.appendChild(style);

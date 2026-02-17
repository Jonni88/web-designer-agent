'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Download, Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generateSite = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: 'modern' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.site);
      } else {
        setError(data.error || 'Ошибка генерации');
      }
    } catch (err) {
      setError('Не удалось сгенерировать сайт');
    } finally {
      setLoading(false);
    }
  };

  const downloadHTML = () => {
    if (!result?.html) return;
    
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title?.replace(/\s+/g, '-').toLowerCase() || 'site'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web Designer Agent
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Опиши сайт своими словами — AI создаст красивый дизайн с уникальными изображениями
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: Сайт для кофейни в стиле лофт с тёмными тонами, большими фото кофе и уютной атмосферой..."
              className="w-full h-32 p-4 rounded-xl bg-slate-800/50 border border-white/20 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <button
              onClick={generateSite}
              disabled={loading || !prompt.trim()}
              className="mt-4 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Генерирую сайт и изображения...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Создать сайт
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300">
              {error}
            </div>
          )}
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{result.title}</h2>
                  <p className="text-gray-300">{result.description}</p>
                </div>
                
                <button
                  onClick={downloadHTML}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-xl hover:bg-green-500 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Скачать HTML
                </button>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl overflow-hidden">
                <iframe
                  srcDoc={result.html}
                  className="w-full h-[600px] border-0"
                  title="Preview"
                />
              </div>

              {/* Generated Images */}
              {result.images && result.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Сгенерированные изображения:</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {result.images.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Generated ${idx + 1}`}
                        className="rounded-xl w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

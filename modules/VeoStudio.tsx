import React, { useState, useRef } from 'react';
import { Video, Upload, Play, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

const VeoStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         setError("Image too large. Please select an image under 10MB.");
         return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip the data URL prefix for the API calls later if needed, 
        // but for display we keep it. The API helper will handle stripping if necessary,
        // or we pass the base64 data block.
        // Google GenAI expects standard base64 without prefix usually, but let's store full string for display
        setSelectedImage(base64String);
        setMimeType(file.type);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Extract base64 data part
      const base64Data = selectedImage.split(',')[1];
      
      const generatedVideoUrl = await generateVeoVideo(base64Data, mimeType, prompt);
      setVideoUrl(generatedVideoUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-2 text-[#d3122a]" />
          Veo Creative Studio
        </h2>
        <p className="text-slate-500">Transform product shots into marketing videos using Google Veo AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div 
            className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors h-64
              ${selectedImage ? 'border-[#003882] bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}
            `}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              // Handle drop logic if needed, simplifed to click for now
            }}
          >
            {selectedImage ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain" />
                <button 
                  onClick={() => { setSelectedImage(null); setVideoUrl(null); }}
                  className="absolute top-2 right-2 bg-slate-900/50 hover:bg-slate-900 text-white p-1 rounded-full"
                >
                  <Upload size={16} className="rotate-45" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-[#003882] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to upload product image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Select File
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Creative Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Cinematic slow pan of the paint bucket on a wooden floor, sun rays hitting the label..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003882] outline-none h-32 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedImage || isGenerating}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all
              ${!selectedImage || isGenerating 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#003882] to-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="w-6 h-6 mr-2" />
                Generate Marketing Asset
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start text-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="bg-[#002f6c] rounded-xl overflow-hidden flex flex-col h-full min-h-[400px]">
          <div className="flex-1 flex items-center justify-center p-8">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full rounded-lg shadow-2xl"
                autoPlay
                loop
              />
            ) : (
              <div className="text-center text-slate-500">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-blue-300 animate-pulse">AI is dreaming up your video...</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">This may take a minute. Veo is calculating lighting, physics, and motion.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Play className="w-16 h-16 mx-auto opacity-20 text-white" />
                    <p className="text-slate-400">Video preview will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-[#002250] p-4 border-t border-blue-900">
            <div className="flex justify-between items-center text-xs text-blue-300">
              <span>Model: <span className="text-white">veo-3.1-fast-generate-preview</span></span>
              <span>Res: <span className="text-white">720p (16:9)</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeoStudio;
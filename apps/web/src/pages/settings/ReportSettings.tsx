import React from 'react';
import { FileText, Upload, Save } from 'lucide-react';

export function ReportSettings() {
  return (
    <div className="bg-[#151729]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 text-white mt-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-8 tracking-wide">
        <FileText className="w-6 h-6 text-yellow-400" /> PDF Report Settings
      </h2>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Brand Logo</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-white/40" />
                <p className="mb-2 text-sm text-white/60"><span className="font-semibold text-white/80">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-white/40">SVG, PNG, JPG (MAX. 800x400px)</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Report Header Title</label>
          <input 
            type="text" 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors placeholder:text-white/30" 
            placeholder="e.g. AstroVanta Comprehensive Analysis"
            defaultValue="AstroVanta"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Custom Disclaimer Text</label>
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 focus:border-purple-500 outline-none text-white placeholder:text-white/30 transition-colors" 
            defaultValue="This astrological report is for entertainment and guidance purposes only."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 transition-all">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Upload, FileText, Image, FileSpreadsheet, ArrowRight, X, Edit3, AlertTriangle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function SurveyUpload() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreview(null);
  };

  const handleContinue = () => {
    if (uploadedFile) {
      navigate('/admin/surveys/extract', { state: { file: uploadedFile, preview } });
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Upload Survey Data</h1>
          <p className="text-gray-600 font-medium">Upload scanned forms, images, or CSV files to extract community needs</p>
        </motion.div>

        {/* Upload Method Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Image className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Image / PDF Upload</h3>
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              Our OCR system automatically extracts data from scanned community survey forms
            </p>
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">
              <span className="px-2 py-1 bg-white/20 rounded-md">JPG</span>
              <span className="px-2 py-1 bg-white/20 rounded-md">PNG</span>
              <span className="px-2 py-1 bg-white/20 rounded-md">PDF</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="w-12 h-12 bg-[#14B8A6]/10 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <h3 className="text-xl text-gray-900 font-bold mb-2">CSV / Excel Upload</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Import bulk community data directly from legacy NGO spreadsheets
            </p>
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md ring-1 ring-gray-200">CSV</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md ring-1 ring-gray-200">XLSX</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/admin/surveys/manual')}
            className="bg-white rounded-2xl p-6 border border-indigo-100 bg-indigo-50/10 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Edit3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl text-gray-900 font-bold">Direct Manual Entry</h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase">Standard</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Manually record a specific community requirement for immediate volunteer assignment
            </p>
            <div className="flex items-center text-[#1E3A8A] text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
              Open Form <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border border-gray-200"
        >
          {!uploadedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Drop files here or click to upload</h3>
              <p className="text-gray-600 mb-6">
                Support for images (JPG, PNG), PDF, CSV, and Excel files
              </p>

              <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 cursor-pointer transition-colors">
                <FileText className="w-5 h-5" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.csv,.xlsx"
                  onChange={handleChange}
                />
              </label>

              <p className="text-xs text-gray-500 mt-4">Maximum file size: 10MB</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-base text-gray-900 mb-1">{uploadedFile.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1 }}
                        className="h-full bg-[#14B8A6]"
                      />
                    </div>
                    <span className="text-xs text-gray-600">100%</span>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {preview && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Full preview"
                    className="w-full max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={removeFile}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Extraction
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-base text-gray-900 mb-3">Tips for better OCR results:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A8A] mt-1">•</span>
              <span>Ensure the form is well-lit and text is clearly visible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A8A] mt-1">•</span>
              <span>Avoid blurry or low-resolution images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A8A] mt-1">•</span>
              <span>For CSV uploads, ensure column headers match our template format</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

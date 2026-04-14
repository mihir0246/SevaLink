import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, AlertCircle, CheckCircle, MapPin, User, Home, Activity, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { surveysAPI } from '../services/api';

interface ExtractedData {
  name: string;
  householdId: string;
  city: string;
  area: string;
  coordinates: string;
  needType: string;
  quantity: string;
  urgency: string;
  notes: string;
  metadata: Record<string, any>;
  confidence: Record<string, number>;
}

export default function SurveyExtraction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { preview, file } = location.state || {}; // Get the real file from state

  const [extractedData, setExtractedData] = useState<ExtractedData>({
    name: '',
    householdId: '',
    city: '',
    area: '',
    coordinates: '',
    needType: 'Food',
    quantity: '',
    urgency: 'medium',
    notes: '',
    metadata: {},
    confidence: {}
  });

  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!file) {
      navigate('/admin/surveys');
      return;
    }

    const performExtraction = async () => {
      try {
        setIsProcessing(true);
        const res = await surveysAPI.extract(file);
        const { extracted, confidence } = res.data;
        
        setExtractedData({
          ...extracted,
          confidence,
          coordinates: extracted.coordinates || '', // Ensure optional fields are strings
        });
        
        toast.success('AI Data Extraction completed!', {
          description: 'Please review the fields below for accuracy.'
        });
      } catch (err: any) {
        toast.error('Extraction failed', {
          description: err.response?.data?.msg || 'Could not process the survey file.'
        });
        navigate('/admin/surveys');
      } finally {
        setIsProcessing(false);
      }
    };

    performExtraction();
  }, [file, navigate]);

  const getConfidenceColor = (field: string) => {
    const confidence = extractedData.confidence[field] || 1;
    if (confidence < 0.7) return 'border-red-300 bg-red-50';
    if (confidence < 0.9) return 'border-yellow-300 bg-yellow-50';
    return 'border-gray-200';
  };

  const getConfidenceBadge = (field: string) => {
    const confidence = extractedData.confidence[field];
    if (confidence === undefined) return null;

    const percentage = Math.round(confidence * 100);
    const colorClass = confidence < 0.7 ? 'text-red-600' : confidence < 0.9 ? 'text-amber-600' : 'text-emerald-600';
    const Icon = confidence < 0.7 ? AlertCircle : confidence < 0.9 ? AlertCircle : CheckCircle;

    return (
      <motion.div 
        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-1.5 mt-2 font-bold tracking-tight ${colorClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] uppercase">{percentage}% AI Confidence</span>
      </motion.div>
    );
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      await surveysAPI.confirm(extractedData);
      toast.success('Survey data saved successfully!', {
        description: 'The need has been added to the system.'
      });
      navigate('/admin/needs');
    } catch (err: any) {
      toast.error('Failed to save data', {
        description: err.response?.data?.msg || 'An error occurred while saving.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/surveys')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <div>
              <h1 className="text-xl text-gray-900">OCR Data Extraction</h1>
              <p className="text-sm text-gray-600">Review and correct extracted information</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Confirm & Save
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image Preview */}
        <div className="w-1/2 bg-gray-900 flex items-center justify-center p-6 overflow-auto">
          <div className="max-w-full max-h-full">
            {preview ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={preview}
                alt="Survey form"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80"
                  alt="Survey placeholder"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Form Fields */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="p-8">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className="relative w-24 h-24 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-[#1E3A8A]/10 border-t-[#1E3A8A] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-full flex items-center justify-center text-white"
                  >
                    <Activity className="w-8 h-8" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">AI Engine Scanning...</h2>
                <p className="text-gray-500 font-medium">Gemini 1.5 Flash is analyzing your document for community needs and extracting semantic data.</p>
                <div className="mt-8 w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1/2 h-full bg-[#1E3A8A]"
                  />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#1E3A8A]" />
                    <h2 className="text-lg text-gray-900">Personal Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={extractedData.name}
                        onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('name')}`}
                      />
                      {getConfidenceBadge('name')}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Household ID</label>
                      <input
                        type="text"
                        value={extractedData.householdId}
                        onChange={(e) => setExtractedData({ ...extractedData, householdId: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('householdId')}`}
                      />
                      {getConfidenceBadge('householdId')}
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#1E3A8A]" />
                    <h2 className="text-lg text-gray-900">Location</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={extractedData.city}
                        onChange={(e) => setExtractedData({ ...extractedData, city: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('city')}`}
                      />
                      {getConfidenceBadge('city')}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Area / Zone</label>
                      <input
                        type="text"
                        value={extractedData.area}
                        onChange={(e) => setExtractedData({ ...extractedData, area: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('area')}`}
                      />
                      {getConfidenceBadge('area')}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Coordinates (Optional)</label>
                      <input
                        type="text"
                        value={extractedData.coordinates}
                        onChange={(e) => setExtractedData({ ...extractedData, coordinates: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors"
                        placeholder="Latitude, Longitude"
                      />
                    </div>
                  </div>
                </div>

                {/* Need Details */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#1E3A8A]" />
                    <h2 className="text-lg text-gray-900">Need Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Type of Need</label>
                      <select
                        value={extractedData.needType}
                        onChange={(e) => setExtractedData({ ...extractedData, needType: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('needType')}`}
                      >
                        <option value="Food">Food</option>
                        <option value="Medical">Medical</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                      {getConfidenceBadge('needType')}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Quantity / Details</label>
                      <input
                        type="text"
                        value={extractedData.quantity}
                        onChange={(e) => setExtractedData({ ...extractedData, quantity: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors ${getConfidenceColor('quantity')}`}
                      />
                      {getConfidenceBadge('quantity')}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Urgency Level</label>
                      <select
                        value={extractedData.urgency}
                        onChange={(e) => setExtractedData({ ...extractedData, urgency: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        value={extractedData.notes}
                        onChange={(e) => setExtractedData({ ...extractedData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic NGO Parameters (Metadata) */}
                {Object.keys(extractedData.metadata || {}).length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-[#1E3A8A]" />
                      <h2 className="text-lg text-gray-900">NGO Specific Parameters</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(extractedData.metadata).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm text-gray-700 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="text"
                            value={String(value)}
                            onChange={(e) => setExtractedData({
                              ...extractedData,
                              metadata: { ...extractedData.metadata, [key]: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Summary */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      Extraction Confidence
                    </h3>
                    <p className="text-xs text-gray-700">
                      Fields highlighted in yellow or red have lower confidence. Please verify these manually.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

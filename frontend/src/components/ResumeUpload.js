import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Eye,
  Loader2
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ResumeUpload = ({ onResumeUploaded, currentResume }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      const fileType = file.name.split('.').pop().toLowerCase();

      const requestData = {
        file_content: base64,
        filename: file.name,
        file_type: fileType
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload resume');
      }

      const data = await response.json();
      setUploadSuccess(true);
      
      // Call parent callback with resume data
      onResumeUploaded({
        id: data.resume_id,
        filename: file.name,
        extracted_skills: data.extracted_skills,
        extracted_experience: data.extracted_experience,
        extracted_qualifications: data.extracted_qualifications,
        extracted_keywords: data.extracted_keywords
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  }, [onResumeUploaded]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handlePreview = async () => {
    if (!currentResume) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/resumes`);
      const data = await response.json();
      
      const resume = data.resumes.find(r => r.id === currentResume.id);
      if (resume) {
        setPreviewText(resume.original_text);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error fetching resume text:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload your resume in PDF, DOCX, DOC, or TXT format to analyze your skills and qualifications
        </p>
      </div>

      {/* Current Resume Status */}
      {currentResume && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Resume Uploaded Successfully</h3>
                <p className="text-sm text-green-600">{currentResume.filename}</p>
              </div>
            </div>
            <button
              onClick={handlePreview}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-800">Processing your resume...</p>
                  <p className="text-sm text-gray-600">Analyzing content with AI</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                  </p>
                  <p className="text-sm text-gray-600">or click to select a file</p>
                </div>
                <div className="text-xs text-gray-500">
                  Supported formats: PDF, DOCX, DOC, TXT • Max size: 100MB
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-700">Resume uploaded and analyzed successfully!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Information */}
      {currentResume && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Extracted Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Skills ({currentResume.extracted_skills?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentResume.extracted_skills?.map((skill, index) => (
                    <div key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {skill}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No skills extracted</p>}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Experience ({currentResume.extracted_experience?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentResume.extracted_experience?.map((exp, index) => (
                    <div key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                      {exp}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No experience extracted</p>}
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Qualifications ({currentResume.extracted_qualifications?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentResume.extracted_qualifications?.map((qual, index) => (
                    <div key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                      {qual}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No qualifications extracted</p>}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Keywords ({currentResume.extracted_keywords?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentResume.extracted_keywords?.map((keyword, index) => (
                    <div key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      {keyword}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No keywords extracted</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Resume Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {previewText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
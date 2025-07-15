import React, { useState } from 'react';
import { 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Target,
  Search
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const JobDescription = ({ onJobAnalyzed, currentJob }) => {
  const [formData, setFormData] = useState({
    title: currentJob?.title || '',
    description: currentJob?.description || ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setAnalysisError('Please fill in both job title and description');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze job description');
      }

      const data = await response.json();
      setAnalysisSuccess(true);
      
      // Call parent callback with job data
      onJobAnalyzed({
        id: data.job_id,
        title: formData.title,
        description: formData.description,
        required_skills: data.required_skills,
        required_experience: data.required_experience,
        required_qualifications: data.required_qualifications,
        extracted_keywords: data.extracted_keywords
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      description: ''
    });
    setAnalysisError(null);
    setAnalysisSuccess(false);
  };

  const sampleJobDescriptions = [
    {
      title: "Frontend Developer",
      description: "We are seeking a skilled Frontend Developer to join our team. You will be responsible for developing user-facing features using React, implementing responsive designs, and ensuring cross-browser compatibility. Requirements include 3+ years of experience with JavaScript, React, HTML5, CSS3, and modern build tools. Bachelor's degree in Computer Science or equivalent experience preferred."
    },
    {
      title: "Data Scientist",
      description: "Looking for a Data Scientist to analyze complex datasets and build predictive models. Responsibilities include developing machine learning algorithms, creating data visualizations, and presenting insights to stakeholders. Required qualifications: PhD in Statistics, Mathematics, or related field, 5+ years of experience with Python, R, SQL, and machine learning frameworks like TensorFlow or PyTorch."
    },
    {
      title: "Product Manager",
      description: "We need a Product Manager to lead product development initiatives. You'll work with cross-functional teams to define product requirements, manage roadmaps, and ensure successful product launches. Requirements: MBA or equivalent, 7+ years of product management experience, strong analytical skills, experience with Agile methodologies, and excellent communication skills."
    }
  ];

  const loadSample = (sample) => {
    setFormData({
      title: sample.title,
      description: sample.description
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Description Analysis</h1>
        <p className="text-gray-600">
          Enter a job description to analyze required skills, experience, and qualifications
        </p>
      </div>

      {/* Current Job Status */}
      {currentJob && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Job Description Analyzed</h3>
              <p className="text-sm text-green-600">{currentJob.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Jobs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sample Job Descriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleJobDescriptions.map((sample, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">{sample.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {sample.description.substring(0, 100)}...
                </p>
                <button
                  onClick={() => loadSample(sample)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Use this example
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Description Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
                <Briefcase className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Paste the complete job description here including responsibilities, requirements, qualifications, and preferred skills..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Error Message */}
            {analysisError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{analysisError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {analysisSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-700">Job description analyzed successfully!</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Analyze Job Description</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Analysis Results */}
      {currentJob && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required Skills */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Required Skills ({currentJob.required_skills?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentJob.required_skills?.map((skill, index) => (
                    <div key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {skill}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No required skills found</p>}
                </div>
              </div>

              {/* Required Experience */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Required Experience ({currentJob.required_experience?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentJob.required_experience?.map((exp, index) => (
                    <div key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                      {exp}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No required experience found</p>}
                </div>
              </div>

              {/* Required Qualifications */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Required Qualifications ({currentJob.required_qualifications?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentJob.required_qualifications?.map((qual, index) => (
                    <div key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                      {qual}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No required qualifications found</p>}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Keywords ({currentJob.extracted_keywords?.length || 0})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentJob.extracted_keywords?.map((keyword, index) => (
                    <div key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      {keyword}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No keywords found</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescription;
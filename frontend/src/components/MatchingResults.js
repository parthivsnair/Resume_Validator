import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  X,
  Lightbulb,
  Award,
  Users,
  BookOpen,
  Code,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import LoadingSpinner from './LoadingSpinner';

const MatchingResults = ({ currentResume, currentJob, matchResult, onMatchCompleted }) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchingError, setMatchingError] = useState(null);
  const [detailedMatch, setDetailedMatch] = useState(null);

  useEffect(() => {
    if (matchResult) {
      setDetailedMatch(matchResult);
    }
  }, [matchResult]);

  const handleMatch = async () => {
    if (!currentResume || !currentJob) {
      setMatchingError('Both resume and job description are required');
      return;
    }

    setIsMatching(true);
    setMatchingError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: currentResume.id,
          job_id: currentJob.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to match resume with job');
      }

      const data = await response.json();
      
      const matchData = {
        match_id: data.match_id,
        overall_score: data.overall_score,
        skills_match: data.skills_match,
        experience_match: data.experience_match,
        qualifications_match: data.qualifications_match,
        matched_keywords: data.matched_keywords,
        missing_skills: data.missing_skills,
        suggestions: data.suggestions,
        detailed_analysis: data.detailed_analysis
      };

      setDetailedMatch(matchData);
      onMatchCompleted(matchData);

    } catch (error) {
      console.error('Matching error:', error);
      setMatchingError(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Data for charts
  const pieData = detailedMatch ? [
    { name: 'Match', value: detailedMatch.overall_score, color: getScoreColor(detailedMatch.overall_score) },
    { name: 'Gap', value: 100 - detailedMatch.overall_score, color: '#e5e7eb' }
  ] : [];

  const barData = detailedMatch ? [
    { name: 'Skills', score: detailedMatch.skills_match?.score || 0, color: '#3b82f6' },
    { name: 'Experience', score: detailedMatch.experience_match?.score || 0, color: '#10b981' },
    { name: 'Qualifications', score: detailedMatch.qualifications_match?.score || 0, color: '#8b5cf6' }
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Prerequisites check
  const canMatch = currentResume && currentJob;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Match Analysis</h1>
        <p className="text-gray-600">
          AI-powered semantic matching between your resume and job requirements
        </p>
      </div>

      {/* Prerequisites Check */}
      {!canMatch && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">Prerequisites Required</h3>
              <p className="text-sm text-yellow-700">
                You need both a resume and job description to perform matching analysis.
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            {!currentResume && (
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Upload Resume
              </Link>
            )}
            {!currentJob && (
              <Link
                to="/job-description"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Add Job Description
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Current Status */}
      {canMatch && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ready for Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Resume Ready</p>
                  <p className="text-sm text-green-600">{currentResume.filename}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Job Ready</p>
                  <p className="text-sm text-green-600">{currentJob.title}</p>
                </div>
              </div>
            </div>
            
            {!detailedMatch && (
              <div className="mt-6">
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Match...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      <span>Start Match Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {matchingError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Analysis Failed</h3>
              <p className="text-sm text-red-700">{matchingError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Match Results */}
      {detailedMatch && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Overall Match Score</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx={100}
                          cy={100}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800">
                          {detailedMatch.overall_score.toFixed(1)}%
                        </div>
                        <div className={`text-sm px-2 py-1 rounded ${getScoreBg(detailedMatch.overall_score)}`}>
                          {getScoreLabel(detailedMatch.overall_score)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-800">Match Quality</p>
                      <p className="text-sm text-gray-600">{getScoreLabel(detailedMatch.overall_score)} fit for this role</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Competitive Edge</p>
                      <p className="text-sm text-gray-600">
                        {detailedMatch.overall_score >= 80 ? 'Strong candidate' : 
                         detailedMatch.overall_score >= 60 ? 'Solid candidate' : 
                         detailedMatch.overall_score >= 40 ? 'Room for improvement' : 'Needs development'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Category Breakdown</h2>
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Code className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Skills Match</p>
                        <p className="text-2xl font-bold text-blue-900">{detailedMatch.skills_match?.score?.toFixed(1) || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Experience Match</p>
                        <p className="text-2xl font-bold text-green-900">{detailedMatch.experience_match?.score?.toFixed(1) || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-800">Qualifications Match</p>
                        <p className="text-2xl font-bold text-purple-900">{detailedMatch.qualifications_match?.score?.toFixed(1) || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Matched Keywords */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Matched Keywords ({detailedMatch.matched_keywords?.length || 0})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailedMatch.matched_keywords?.map((keyword, index) => (
                    <div key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                      {keyword}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No matched keywords found</p>}
                </div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  Missing Skills ({detailedMatch.missing_skills?.length || 0})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailedMatch.missing_skills?.map((skill, index) => (
                    <div key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
                      {skill}
                    </div>
                  )) || <p className="text-gray-500 text-sm">No missing skills identified</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {detailedMatch.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <ArrowRight className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{suggestion}</p>
                  </div>
                )) || <p className="text-gray-500 text-sm">No specific suggestions available</p>}
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Analysis</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{detailedMatch.detailed_analysis}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Next Steps</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  <span>Re-analyze Match</span>
                </button>
                <Link
                  to="/history"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Match History</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingResults;
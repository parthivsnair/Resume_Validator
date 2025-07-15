import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Download,
  Filter,
  X,
  FileText,
  Briefcase,
  Target,
  Clock
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/matches`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      const data = await response.json();
      setMatches(data.matches || []);
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-blue-100 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  const filteredAndSortedMatches = matches
    .filter(match => {
      const matchesSearch = searchTerm === '' || 
        match.match_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.resume_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.job_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'excellent' && match.overall_score >= 80) ||
        (filterBy === 'good' && match.overall_score >= 60 && match.overall_score < 80) ||
        (filterBy === 'average' && match.overall_score >= 40 && match.overall_score < 60) ||
        (filterBy === 'poor' && match.overall_score < 40);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest':
          return b.overall_score - a.overall_score;
        case 'lowest':
          return a.overall_score - b.overall_score;
        default:
          return 0;
      }
    });

  const handleViewDetails = async (matchId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/match/${matchId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch match details');
      }
      
      const data = await response.json();
      setSelectedMatch(data);
      
    } catch (err) {
      console.error('Error fetching match details:', err);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Match ID', 'Overall Score', 'Skills Score', 'Experience Score', 'Qualifications Score', 'Created At'],
      ...filteredAndSortedMatches.map(match => [
        match.match_id,
        match.overall_score.toFixed(1),
        match.skills_match?.score?.toFixed(1) || 0,
        match.experience_match?.score?.toFixed(1) || 0,
        match.qualifications_match?.score?.toFixed(1) || 0,
        new Date(match.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'match_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700">Error loading match history: {error}</p>
          <button 
            onClick={fetchMatches}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Match History</h1>
        <p className="text-gray-600">
          Review your previous resume and job description matches
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-800">{matches.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {matches.length > 0 
                  ? (matches.reduce((sum, match) => sum + match.overall_score, 0) / matches.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {matches.length > 0 
                  ? Math.max(...matches.map(m => m.overall_score)).toFixed(1)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-800">
                {matches.filter(match => {
                  const matchDate = new Date(match.created_at);
                  const now = new Date();
                  return matchDate.getMonth() === now.getMonth() && matchDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters and Sort */}
            <div className="flex space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Matches</option>
                <option value="excellent">Excellent (80%+)</option>
                <option value="good">Good (60-79%)</option>
                <option value="average">Average (40-59%)</option>
                <option value="poor">Poor (&lt;40%)</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
              
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedMatches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-12 text-center">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              {matches.length === 0 
                ? "You haven't performed any matches yet. Start by uploading a resume and job description."
                : "No matches match your current search criteria."}
            </p>
            {matches.length === 0 && (
              <Link
                to="/upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Get Started
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedMatches.map((match) => (
                <div key={match.match_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getScoreBg(match.overall_score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(match.overall_score)}`}>
                          {Math.round(match.overall_score)}%
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Match Analysis</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(match.created_at).toLocaleDateString()} • {getScoreLabel(match.overall_score)} match
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Skills: {match.skills_match?.score?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Experience: {match.experience_match?.score?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Qualifications: {match.qualifications_match?.score?.toFixed(1) || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(match.match_id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Match Details</h2>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-6">
                {/* Match Summary */}
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getScoreBg(selectedMatch.match.overall_score)}`}>
                    <span className={getScoreColor(selectedMatch.match.overall_score)}>
                      {selectedMatch.match.overall_score.toFixed(1)}% Overall Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Analyzed on {new Date(selectedMatch.match.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* File Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Resume</span>
                    </div>
                    <p className="text-sm text-blue-700">{selectedMatch.resume?.filename || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Job</span>
                    </div>
                    <p className="text-sm text-green-700">{selectedMatch.job?.title || 'N/A'}</p>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Detailed Analysis</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedMatch.match.detailed_analysis}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {selectedMatch.match.suggestions && selectedMatch.match.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Suggestions</h3>
                    <div className="space-y-2">
                      {selectedMatch.match.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-yellow-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
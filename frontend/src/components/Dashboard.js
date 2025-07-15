import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = ({ currentResume, currentJob, matchResult }) => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalJobs: 0,
    totalMatches: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resumesRes, jobsRes, matchesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/resumes`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/jobs`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/matches`)
      ]);

      const resumes = await resumesRes.json();
      const jobs = await jobsRes.json();
      const matches = await matchesRes.json();

      const totalMatches = matches.matches?.length || 0;
      const averageScore = totalMatches > 0 
        ? matches.matches.reduce((sum, match) => sum + match.overall_score, 0) / totalMatches
        : 0;

      setStats({
        totalResumes: resumes.resumes?.length || 0,
        totalJobs: jobs.jobs?.length || 0,
        totalMatches,
        averageScore: Math.round(averageScore * 10) / 10
      });

      // Get recent matches (last 5)
      const recent = matches.matches
        ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5) || [];
      setRecentMatches(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getNextStep = () => {
    if (!currentResume && !currentJob) {
      return {
        title: 'Upload Your Resume',
        description: 'Start by uploading your resume to analyze your skills and qualifications.',
        link: '/upload',
        icon: Upload,
        color: 'bg-blue-500'
      };
    }
    
    if (currentResume && !currentJob) {
      return {
        title: 'Add Job Description',
        description: 'Add a job description to analyze requirements and match with your resume.',
        link: '/job-description',
        icon: FileText,
        color: 'bg-green-500'
      };
    }
    
    if (currentResume && currentJob && !matchResult) {
      return {
        title: 'Analyze Match',
        description: 'Run the matching analysis to see how well your resume fits the job.',
        link: '/match',
        icon: Target,
        color: 'bg-purple-500'
      };
    }
    
    return {
      title: 'View Results',
      description: 'Check your matching results and get improvement suggestions.',
      link: '/match',
      icon: CheckCircle,
      color: 'bg-indigo-500'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const nextStep = getNextStep();
  const NextStepIcon = nextStep.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Resume Matcher
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered resume and job description matching system
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resumes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalResumes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Descriptions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalJobs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMatches}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Next Step and Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Step */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Next Step</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${nextStep.color} rounded-lg flex items-center justify-center`}>
              <NextStepIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{nextStep.title}</h3>
              <p className="text-sm text-gray-600">{nextStep.description}</p>
            </div>
          </div>
          <Link
            to={nextStep.link}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Get Started</span>
            <NextStepIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Matches</h2>
          {recentMatches.length > 0 ? (
            <div className="space-y-3">
              {recentMatches.map((match, index) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getScoreBg(match.overall_score)} rounded-full flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${getScoreColor(match.overall_score)}`}>
                        {Math.round(match.overall_score)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Match #{index + 1}</p>
                      <p className="text-xs text-gray-600">{new Date(match.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${getScoreColor(match.overall_score)}`}>
                    {match.overall_score.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No matches yet</p>
              <p className="text-sm text-gray-500">Start by uploading a resume and job description</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${currentResume ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentResume ? 'bg-green-500' : 'bg-gray-400'}`}>
                {currentResume ? <CheckCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-800">Resume</p>
                <p className="text-sm text-gray-600">
                  {currentResume ? currentResume.filename : 'Not uploaded'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${currentJob ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentJob ? 'bg-green-500' : 'bg-gray-400'}`}>
                {currentJob ? <CheckCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-800">Job Description</p>
                <p className="text-sm text-gray-600">
                  {currentJob ? currentJob.title : 'Not added'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${matchResult ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${matchResult ? 'bg-green-500' : 'bg-gray-400'}`}>
                {matchResult ? <CheckCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-800">Match Analysis</p>
                <p className="text-sm text-gray-600">
                  {matchResult ? `${matchResult.overall_score.toFixed(1)}% match` : 'Not completed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
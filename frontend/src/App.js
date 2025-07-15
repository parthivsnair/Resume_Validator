import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import MatchingResults from './components/MatchingResults';
import MatchHistory from './components/MatchHistory';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentResume, setCurrentResume] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleResumeUploaded = (resumeData) => {
    setCurrentResume(resumeData);
  };

  const handleJobAnalyzed = (jobData) => {
    setCurrentJob(jobData);
  };

  const handleMatchCompleted = (matchData) => {
    setMatchResult(matchData);
  };

  const resetAll = () => {
    setCurrentResume(null);
    setCurrentJob(null);
    setMatchResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Loading Resume Matcher...</h2>
          <p className="mt-2 text-gray-600">Initializing AI-powered matching system</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation onReset={resetAll} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  currentResume={currentResume}
                  currentJob={currentJob}
                  matchResult={matchResult}
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ResumeUpload 
                  onResumeUploaded={handleResumeUploaded}
                  currentResume={currentResume}
                />
              } 
            />
            <Route 
              path="/job-description" 
              element={
                <JobDescription 
                  onJobAnalyzed={handleJobAnalyzed}
                  currentJob={currentJob}
                />
              } 
            />
            <Route 
              path="/match" 
              element={
                <MatchingResults 
                  currentResume={currentResume}
                  currentJob={currentJob}
                  matchResult={matchResult}
                  onMatchCompleted={handleMatchCompleted}
                />
              } 
            />
            <Route 
              path="/history" 
              element={<MatchHistory />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
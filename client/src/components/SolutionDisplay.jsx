// client/src/components/SolutionDisplay.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Copy, Check, Code, Clock, Zap, 
  BookOpen, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SolutionDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await axios.get(`${API_URL}/problems/${id}`);
      setProblem(response.data.data.problem);
    } catch (error) {
      console.error('Fetch problem error:', error);
      alert('Failed to load problem');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Problem not found</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const solution = problem.solution;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Problem Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {problem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {problem.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">
                  {problem.difficulty}
                </span>
                {problem.language && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {problem.language}
                  </span>
                )}
                {problem.status === 'solved' ? (
                  <span className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Solved</span>
                  </span>
                ) : problem.status === 'failed' ? (
                  <span className="flex items-center space-x-1 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Failed</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-yellow-600">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Processing</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
          </div>

          {problem.tags && problem.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {problem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Solution */}
        {solution && (
          <>
            {/* AI Model and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">AI Model</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {solution.aiModel?.toUpperCase() || 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Processing Time</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {solution.processingTime ? (solution.processingTime / 1000).toFixed(2) + 's' : 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Tokens Used</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {solution.tokenUsage?.total || 'N/A'}
                </p>
              </div>
            </div>

            {/* Solution Content */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>AI-Generated Solution</span>
              </h2>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {solution.answer}
                </div>
              </div>
            </div>

            {/* Explanation */}
            {solution.explanation && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Explanation</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {solution.explanation}
                </p>
              </div>
            )}

            {/* Steps */}
            {solution.steps && solution.steps.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Step-by-Step Solution</h3>
                <div className="space-y-4">
                  {solution.steps.map((step) => (
                    <div key={step.stepNumber} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {step.stepNumber}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{step.description}</p>
                        {step.code && (
                          <pre className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                            <code className="text-sm">{step.code}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code Solution */}
            {solution.code && solution.code.snippet && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Code className="h-6 w-6" />
                    <span>Code Solution</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(solution.code.snippet)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-gray-100">
                    <code>{solution.code.snippet}</code>
                  </pre>
                </div>

                {solution.code.language && (
                  <p className="mt-2 text-sm text-gray-600">
                    Language: <span className="font-semibold">{solution.code.language}</span>
                  </p>
                )}
              </div>
            )}

            {/* Optimized Version */}
            {solution.code?.optimizedVersion && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    <span>Optimized Version</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(solution.code.optimizedVersion)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-gray-100">
                    <code>{solution.code.optimizedVersion}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Execution Result */}
            {solution.executionResult && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  {solution.executionResult.status === 'Accepted' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span>Execution Result</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
                    <p className={`font-medium ${
                      solution.executionResult.status === 'Accepted' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {solution.executionResult.status}
                    </p>
                  </div>

                  {solution.executionResult.output && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Output</p>
                      <pre className="p-4 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                        <code className="text-sm">{solution.executionResult.output}</code>
                      </pre>
                    </div>
                  )}

                  {solution.executionResult.error && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Error</p>
                      <pre className="p-4 bg-red-50 rounded border border-red-200 overflow-x-auto">
                        <code className="text-sm text-red-800">{solution.executionResult.error}</code>
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Execution Time</p>
                      <p className="text-gray-900">{solution.executionResult.time || 'N/A'}s</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Memory Used</p>
                      <p className="text-gray-900">{solution.executionResult.memory || 'N/A'} KB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Solution Available */}
        {!solution && problem.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Solution Generation Failed</h3>
            </div>
            <p className="text-red-800">
              We encountered an error while generating a solution for this problem. Please try submitting again or contact support if the issue persists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionDisplay;
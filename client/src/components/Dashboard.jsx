// client/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Filter, Calendar, CheckCircle, 
  XCircle, Clock, Eye, Trash2, Bookmark 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`${API_URL}/problems?${params}`);
      setProblems(response.data.data.problems);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Fetch problems error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axios.delete(`${API_URL}/problems/${id}`);
      setProblems(problems.filter(p => p._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete problem');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      solved: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600'
    };
    return colors[difficulty] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Problems</h1>
          <p className="mt-2 text-gray-600">
            View and manage your submitted problems and AI-generated solutions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Problems</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination?.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Queries Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.apiUsage?.monthlyQueries || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Query Limit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.subscription?.queryLimit || 50}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {user?.subscription?.plan || 'Free'}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Bookmark className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and New Problem Button */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="mathematics">Mathematics</option>
              <option value="writing">Writing</option>
              <option value="debugging">Debugging</option>
              <option value="optimization">Optimization</option>
              <option value="data-science">Data Science</option>
              <option value="algorithm">Algorithm</option>
              <option value="database">Database</option>
              <option value="system-design">System Design</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="solved">Solved</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* New Problem Button */}
            <Link
              to="/new-problem"
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              <span>New Problem</span>
            </Link>
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No problems found</p>
            <Link
              to="/new-problem"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Problem</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((problem) => (
              <div
                key={problem._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(problem.status)}
                      <Link
                        to={`/problem/${problem._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                      >
                        {problem.title}
                      </Link>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {problem.category}
                      </span>
                      
                      {getStatusBadge(problem.status)}
                      
                      <span className={`font-medium capitalize ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>

                      {problem.language && (
                        <span className="text-gray-600">
                          {problem.language}
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                      </span>

                      <span className="flex items-center space-x-1 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>{problem.views || 0} views</span>
                      </span>
                    </div>

                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
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

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/problem/${problem._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="View Solution"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Delete Problem"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
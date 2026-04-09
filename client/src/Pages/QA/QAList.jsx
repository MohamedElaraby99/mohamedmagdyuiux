import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllQAs, upvoteQA, downvoteQA, deleteQA, answerQuestion } from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaEye, 
  FaCalendar, 
  FaUser, 
  FaSearch,
  FaFilter,
  FaPlus,
  FaTag,
  FaClock,
  FaEdit,
  FaTrash,
  FaReply,
  FaCheck
} from "react-icons/fa";

export default function QAList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { qas, loading, totalPages, currentPage, total, categories } = useSelector((state) => state.qa);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // For normal users, only show answered questions
    const statusFilter = isAdmin ? status : (status || "answered");
    
    dispatch(getAllQAs({ 
      page: currentPage, 
      category, 
      search, 
      status: statusFilter,
      sortBy 
    }));
  }, [currentPage, category, search, status, sortBy, isAdmin]);

  const handleVote = async (qaId, voteType) => {
    try {
      if (voteType === 'upvote') {
        await dispatch(upvoteQA(qaId));
      } else {
        await dispatch(downvoteQA(qaId));
      }
    } catch (error) {
    }
  };

  const handleEditQA = (qaId) => {
    // Navigate to edit page
    navigate(`/qa/edit/${qaId}`);
  };

  const handleDeleteQA = async (qaId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال والجواب؟')) {
      try {
        await dispatch(deleteQA(qaId));
        // Refresh the Q&A list after deletion
        dispatch(getAllQAs({ 
          page: currentPage, 
          category, 
          search, 
          status,
          sortBy 
        }));
      } catch (error) {
      }
    }
  };

  const handleAnswerQA = (qaId) => {
    // Navigate to answer page or open answer modal
    navigate(`/qa/${qaId}#answer`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'featured': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'answered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Technical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Course Related': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Payment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Account': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <Layout mainClassName="min-h-[100vh] bg-[#080E1E]">
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {isAdmin ? "إدارة الأسئلة والأجوبة" : "مجتمع الأسئلة والأجوبة"}
            </h1>
            <p className="text-lg text-slate-400 mb-6">
              {isAdmin 
                ? "إدارة الأسئلة وتقديم الإجابات وتنظيم المجتمع"
                : "تصفح الأسئلة وتعلم من مجتمعنا"
              }
            </p>
            {!isAdmin && (
              <Link
                to="/qa/create"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <FaPlus />
                اطرح سؤالاً
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الأسئلة والأجوبة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الفئات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الحالات</option>
                <option value="answered">تم الرد</option>
                {isAdmin && <option value="pending">في الانتظار</option>}
                <option value="featured">مميز</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="votes">الأكثر تصويتاً</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid gap-4 mb-8 ${isAdmin ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{total}</div>
              <div className="text-sm text-green-600 dark:text-green-400">إجمالي الأسئلة والأجوبة</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {qas.filter(qa => qa.status === 'answered').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">تم الرد</div>
            </div>
            {isAdmin && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {qas.filter(qa => qa.status === 'pending').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">في الانتظار</div>
              </div>
            )}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {qas.filter(qa => qa.status === 'featured').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">مميز</div>
            </div>
          </div>

          {/* Q&A List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل الأسئلة والأجوبة...</p>
            </div>
          ) : qas.length > 0 ? (
            <div className="space-y-6">
              {qas.map((qa) => (
                <div key={qa._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(qa.status)}`}>
                          {qa.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(qa.category)}`}>
                          {qa.category}
                        </span>
                      </div>

                      {/* Question */}
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                        <Link to={`/qa/${qa._id}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          {qa.question}
                        </Link>
                      </h3>

                      {/* Answer Preview */}
                      {qa.answer ? (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {qa.answer}
                        </p>
                      ) : isAdmin && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <FaClock className="text-sm" />
                            <span className="text-sm font-medium">في انتظار الإجابة</span>
                          </div>
                          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            هذا السؤال في انتظار أن يقدم المدير إجابة.
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {qa.tags && qa.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {qa.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              <FaTag className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <FaUser />
                            {qa.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar />
                            {formatDate(qa.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye />
                            {qa.views} مشاهدة
                          </span>
                        </div>

                        {/* Voting and Admin Actions */}
                        <div className="flex items-center gap-4">
                          {/* Voting - Only for non-admin users */}
                          {!isAdmin && (
                            <>
                              <button
                                onClick={() => handleVote(qa._id, 'upvote')}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                              >
                                <FaThumbsUp />
                                <span>{qa.upvotes}</span>
                              </button>
                              <button
                                onClick={() => handleVote(qa._id, 'downvote')}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                              >
                                <FaThumbsDown />
                                <span>{qa.downvotes}</span>
                              </button>
                            </>
                          )}

                          {/* Admin Actions */}
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAnswerQA(qa._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                title="Answer Question"
                              >
                                <FaReply />
                                إجابة
                              </button>
                              <button
                                onClick={() => handleEditQA(qa._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                title="Edit Question"
                              >
                                <FaEdit />
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteQA(qa._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                                title="Delete Question"
                              >
                                <FaTrash />
                                حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لم يتم العثور على أسئلة وأجوبة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {search || category || status 
                  ? "حاول تعديل معايير البحث" 
                  : isAdmin 
                    ? "لم يتم طرح أي أسئلة بعد."
                    : "كن أول من يطرح سؤالاً!"
                }
              </p>
              {!search && !category && !status && !isAdmin && (
                <Link
                  to="/qa/create"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  <FaPlus />
                  اطرح سؤالاً
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => dispatch(getAllQAs({ page, category, search, status, sortBy }))}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 
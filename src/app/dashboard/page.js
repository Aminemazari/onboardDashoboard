
"use client"
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faEye, faCheck, faTimes, faEdit, faDownload, faUserMd,
  faHospital, faPhone, faMapMarkerAlt, faCalendarAlt, faPercentage,
  faStethoscope, faMedkit, faHeartbeat, faEyeSlash, faTooth,
  faBrain, faBone, faImage, faFileDownload, faCircleCheck,
  faCircleXmark, faChartLine, faUsers, faClipboardList, faClock,
  faSpinner, faRefresh, faArrowRight, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch submissions from API
  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (specialtyFilter !== 'all') {
        params.append('specialty', specialtyFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/submissions?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubmissionsList(data.data.submissions);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('خطأ في جلب البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/stats/overview`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Update submission status
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setSubmissionsList(prev => prev.map(sub => 
          sub._id === id ? { ...sub, status: newStatus } : sub
        ));
        
        // Refresh stats
        fetchStats();
        
        alert('تم تحديث الحالة بنجاح');
      } else {
        alert('خطأ في تحديث الحالة: ' + data.message);
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم');
      console.error('Update status error:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchSubmissions(1);
  }, [statusFilter, specialtyFilter, searchTerm]);

  // Specialty mapping
  const specialtyMap = {
    'dentist': 'طبيب أسنان',
    'dermatologist': 'طبيب جلدية', 
    'cardiologist': 'طبيب قلب',
    'orthopedic': 'طبيب عظام',
    'ophthalmologist': 'طبيب عيون',
    'neurologist': 'طبيب أعصاب',
    'psychiatrist': 'طبيب نفسي',
    'other': 'آخر'
  };

  // Status mapping
  const statusMap = {
    'قيد المراجعة': { color: 'bg-yellow-100 text-yellow-800', icon: faClock },
    'مُعتمد': { color: 'bg-green-100 text-green-800', icon: faCircleCheck },
    'مرفوض': { color: 'bg-red-100 text-red-800', icon: faCircleXmark }
  };

  // Get specialty icon
  const getSpecialtyIcon = (specialty) => {
    const iconMap = {
      'dentist': faTooth,
      'dermatologist': faHeartbeat,
      'cardiologist': faHeartbeat,
      'orthopedic': faBone,
      'ophthalmologist': faEyeSlash,
      'neurologist': faBrain,
      'psychiatrist': faBrain,
      'other': faStethoscope
    };
    return iconMap[specialty] || faStethoscope;
  };

  const handleViewDetails = async (submissionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedSubmission(data.data);
        setShowModal(true);
      } else {
        alert('خطأ في جلب تفاصيل الطلب');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم');
      console.error('Fetch details error:', err);
    }
  };

  if (loading && submissionsList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white flex items-center justify-center animate-fadeIn">
        <div className="text-center p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md">
          <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-500 animate-spin mb-6" />
          <p className="text-lg text-gray-700 font-semibold tracking-wide">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && submissionsList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-blue-50 flex items-center justify-center animate-fadeIn">
        <div className="text-center p-8 bg-white/90 rounded-2xl shadow-2xl backdrop-blur-md">
          <FontAwesomeIcon icon={faTimes} className="text-5xl text-red-500 mb-6 animate-shake" />
          <p className="text-lg text-red-600 mb-6 font-semibold">{error}</p>
          <button
            onClick={() => fetchSubmissions()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-base"
          >
            <FontAwesomeIcon icon={faRefresh} className="ml-2" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white" dir="rtl">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 text-white py-8 shadow-2xl rounded-b-3xl animate-fadeIn">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold flex items-center gap-3 tracking-tight drop-shadow-lg">
                  <FontAwesomeIcon icon={faClipboardList} className="ml-2 text-4xl animate-pop" />
                  لوحة تحكم طلبات التسجيل
                </h1>
                <p className="text-blue-100 mt-2 text-lg font-medium">إدارة ومراجعة طلبات تسجيل العيادات الطبية</p>
              </div>
              <div className="flex gap-4 items-center">
                {admin && (
                  <span className="font-bold text-lg text-white bg-blue-900/40 px-4 py-2 rounded-xl">{admin.username}</span>
                )}
                <button
                  onClick={() => fetchSubmissions(currentPage)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-base flex items-center gap-2 disabled:opacity-60"
                  disabled={loading}
                >
                  <FontAwesomeIcon 
                    icon={loading ? faSpinner : faRefresh} 
                    className={`ml-2 ${loading ? 'animate-spin' : ''}`} 
                  />
                  تحديث
                </button>
                <button
                  onClick={() => dispatch(logout())}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 transition-all font-bold text-base flex items-center gap-2"
                  title="تسجيل الخروج"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 animate-fadeIn">
          {/* Statistics Cards */}
          {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-l-8 border-blue-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-500 mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.overview.total}</p>
                </div>
                <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-l-8 border-yellow-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-500 mb-1">قيد المراجعة</p>
                  <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.overview.pending}</p>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-4xl text-yellow-500" />
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-l-8 border-green-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-500 mb-1">مُعتمد</p>
                  <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.overview.approved}</p>
                </div>
                <FontAwesomeIcon icon={faCircleCheck} className="text-4xl text-green-500" />
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-l-8 border-red-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-500 mb-1">مرفوض</p>
                  <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.overview.rejected}</p>
                </div>
                <FontAwesomeIcon icon={faCircleXmark} className="text-4xl text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/90 rounded-2xl p-8 shadow-xl mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" 
            />
            <input
              type="text"
              placeholder="البحث بالعيادة أو الطبيب..."
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all text-base bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="w-full md:w-1/4 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all text-base bg-gray-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="مُعتمد">مُعتمد</option>
            <option value="مرفوض">مرفوض</option>
          </select>

          {/* Specialty Filter */}
          <select
            className="w-full md:w-1/4 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all text-base bg-gray-50"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="all">جميع التخصصات</option>
            <option value="dentist">طبيب أسنان</option>
            <option value="dermatologist">طبيب جلدية</option>
            <option value="cardiologist">طبيب قلب</option>
            <option value="orthopedic">طبيب عظام</option>
            <option value="ophthalmologist">طبيب عيون</option>
            <option value="neurologist">طبيب أعصاب</option>
            <option value="psychiatrist">طبيب نفسي</option>
            <option value="other">آخر</option>
          </select>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 via-purple-50 to-white">
                <tr>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">العيادة والطبيب</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">التخصص</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">منصات التواصل</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">الحالة</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">تاريخ التسجيل</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <FontAwesomeIcon icon={faSpinner} className="text-3xl text-blue-500 animate-spin mb-3" />
                      <p className="text-gray-500 text-lg">جاري التحميل...</p>
                    </td>
                  </tr>
                ) : submissionsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <p className="text-gray-400 text-lg">لا توجد طلبات</p>
                    </td>
                  </tr>
                ) : (
                  submissionsList.map((submission) => (
                    <tr key={submission._id} className="hover:bg-blue-50/60 transition-all duration-200 group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <FontAwesomeIcon 
                              icon={faHospital} 
                              className="h-10 w-10 text-blue-500 bg-blue-100 p-2 rounded-full shadow-md group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="mr-5">
                            <div className="text-base font-bold text-gray-900">{submission.clinicName}</div>
                            <div className="text-sm text-gray-500">{submission.doctorName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={getSpecialtyIcon(submission.specialty)} 
                            className="text-gray-400 ml-2 text-lg" 
                          />
                          <span className="text-base text-gray-900 font-semibold">{specialtyMap[submission.specialty] || submission.specialty}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex gap-3">
                          {submission.instagramAccess && (
                            <FontAwesomeIcon 
                              icon={faInstagram} 
                              className="text-pink-500 text-xl hover:scale-125 transition-transform" 
                              title="Instagram Access" 
                            />
                          )}
                          {submission.facebookAccess && (
                            <FontAwesomeIcon 
                              icon={faFacebook} 
                              className="text-blue-600 text-xl hover:scale-125 transition-transform" 
                              title="Facebook Access" 
                            />
                          )}
                          {submission.platformAccessAgreement && (
                            <FontAwesomeIcon 
                              icon={faCheck} 
                              className="text-green-500 text-lg hover:scale-125 transition-transform" 
                              title="Platform Agreement Accepted" 
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${statusMap[submission.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          <FontAwesomeIcon 
                            icon={statusMap[submission.status]?.icon || faClock} 
                            className="ml-2" 
                          />
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-gray-500 font-semibold">
                        {new Date(submission.submissionDate || submission.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base font-bold">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewDetails(submission._id)}
                            className="text-blue-600 hover:text-blue-900 hover:scale-125 transition-all duration-150"
                            title="عرض التفاصيل"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {submission.status === 'قيد المراجعة' && (
                            <>
                              <button
                                onClick={() => updateStatus(submission._id, 'مُعتمد')}
                                className="text-green-600 hover:text-green-900 hover:scale-125 transition-all duration-150"
                                title="اعتماد"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button
                                onClick={() => updateStatus(submission._id, 'مرفوض')}
                                className="text-red-600 hover:text-red-900 hover:scale-125 transition-all duration-150"
                                title="رفض"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/80 px-6 py-5 flex items-center justify-between border-t border-gray-100 rounded-b-2xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchSubmissions(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-5 py-3 border border-gray-200 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  السابق
                </button>
                <button
                  onClick={() => fetchSubmissions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-5 py-3 border border-gray-200 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-base text-gray-700 font-semibold">
                    صفحة <span className="font-bold text-blue-600">{currentPage}</span> من{' '}
                    <span className="font-bold text-purple-600">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-md -space-x-px">
                    <button
                      onClick={() => fetchSubmissions(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-3 rounded-l-xl border border-gray-200 bg-white text-base font-bold text-gray-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return (
                        <button
                          key={page}
                          onClick={() => fetchSubmissions(page)}
                          className={`relative inline-flex items-center px-5 py-3 border text-base font-bold transition-all duration-150 ${
                            page === currentPage
                              ? 'z-10 bg-gradient-to-r from-blue-100 to-purple-100 border-blue-400 text-blue-700 scale-110 shadow-lg'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-blue-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchSubmissions(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-3 rounded-r-xl border border-gray-200 bg-white text-base font-bold text-gray-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/95 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-100 animate-popUp">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-purple-50 to-white border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-3xl shadow-sm">
                <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  تفاصيل طلب: <span className="text-blue-600">{selectedSubmission.clinicName}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
                  title="إغلاق"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">اسم العيادة</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.clinicName}</p>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">اسم الطبيب</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.doctorName}</p>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">التخصص</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">
                      {specialtyMap[selectedSubmission.specialty] || selectedSubmission.specialty}
                    </p>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">رقم الهاتف</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.phoneNumber}</p>
                  </div>
                </div>

                {/* Platform Access Status */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">منصات التواصل الاجتماعي</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm gap-4">
                      <FontAwesomeIcon 
                        icon={faInstagram} 
                        className={`text-3xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-pink-500' : 'text-gray-400'}`}
                      />
                      <div>
                        <p className="text-base font-bold">Instagram</p>
                        <p className={`text-sm ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تم التفعيل' : 'غير مفعل'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm gap-4">
                      <FontAwesomeIcon 
                        icon={faFacebook} 
                        className={`text-3xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-blue-600' : 'text-gray-400'}`}
                      />
                      <div>
                        <p className="text-base font-bold">Facebook</p>
                        <p className={`text-sm ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تم التفعيل' : 'غير مفعل'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm gap-4">
                      <FontAwesomeIcon 
                        icon={selectedSubmission.platformAccessAgreement ? faCheck : faTimes} 
                        className={`text-3xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-green-500' : 'text-red-500'}`}
                      />
                      <div>
                        <p className="text-base font-bold">الموافقة على المنصات</p>
                        <p className={`text-sm ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تمت الموافقة' : 'لم تتم الموافقة'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">معلومات الاتصال</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-base font-bold text-gray-700 mb-2">عنوان العيادة</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.googleMapsLink}</p>
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-700 mb-2">ساعات العمل</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.workingHours}</p>
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-700 mb-2">Gmail Account</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{selectedSubmission.gmailAccount}</p>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">الملفات المرفوعة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedSubmission.logo && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm gap-4">
                        <FontAwesomeIcon icon={faImage} className="text-blue-500 text-2xl ml-3" />
                        <div>
                          <p className="text-base font-bold">شعار العيادة</p>
                          <a 
                            href={selectedSubmission.logo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline font-semibold"
                          >
                            عرض الملف
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedSubmission.pricingFile && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm gap-4">
                        <FontAwesomeIcon icon={faFileDownload} className="text-green-500 text-2xl ml-3" />
                        <div>
                          <p className="text-base font-bold">ملف الأسعار</p>
                          <a 
                            href={selectedSubmission.pricingFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline font-semibold"
                          >
                            تحميل الملف
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Actions */}
                {selectedSubmission.status === 'قيد المراجعة' && (
                  <div className="border-t pt-6 mt-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">تحديث الحالة</h4>
                    <div className="flex gap-6">
                      <button
                        onClick={() => {
                          updateStatus(selectedSubmission._id, 'مُعتمد');
                          setShowModal(false);
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-bold text-base flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                        اعتماد
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(selectedSubmission._id, 'مرفوض');
                          setShowModal(false);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-bold text-base flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimes} className="ml-2" />
                        رفض
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
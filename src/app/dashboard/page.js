"use client"

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && submissionsList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faTimes} className="text-4xl text-red-600 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchSubmissions()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} className="ml-2" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FontAwesomeIcon icon={faClipboardList} className="ml-3" />
                لوحة تحكم طلبات التسجيل
              </h1>
              <p className="text-blue-100 mt-2">إدارة ومراجعة طلبات تسجيل العيادات الطبية</p>
            </div>
            <button
              onClick={() => fetchSubmissions(currentPage)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              disabled={loading}
            >
              <FontAwesomeIcon 
                icon={loading ? faSpinner : faRefresh} 
                className={`ml-2 ${loading ? 'animate-spin' : ''}`} 
              />
              تحديث
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview.total}</p>
                </div>
                <FontAwesomeIcon icon={faClipboardList} className="text-3xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">قيد المراجعة</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview.pending}</p>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-3xl text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مُعتمد</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview.approved}</p>
                </div>
                <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مرفوض</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview.rejected}</p>
                </div>
                <FontAwesomeIcon icon={faCircleXmark} className="text-3xl text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="البحث بالعيادة أو الطبيب..."
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العيادة والطبيب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التخصص
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    منصات التواصل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FontAwesomeIcon icon={faSpinner} className="text-2xl text-blue-600 animate-spin mb-2" />
                      <p className="text-gray-500">جاري التحميل...</p>
                    </td>
                  </tr>
                ) : submissionsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-gray-500">لا توجد طلبات</p>
                    </td>
                  </tr>
                ) : (
                  submissionsList.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <FontAwesomeIcon 
                              icon={faHospital} 
                              className="h-8 w-8 text-blue-500 bg-blue-100 p-2 rounded-full"
                            />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.clinicName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.doctorName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={getSpecialtyIcon(submission.specialty)} 
                            className="text-gray-400 ml-2" 
                          />
                          <span className="text-sm text-gray-900">
                            {specialtyMap[submission.specialty] || submission.specialty}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {submission.instagramAccess && (
                            <FontAwesomeIcon 
                              icon={faInstagram} 
                              className="text-pink-500 text-lg" 
                              title="Instagram Access" 
                            />
                          )}
                          {submission.facebookAccess && (
                            <FontAwesomeIcon 
                              icon={faFacebook} 
                              className="text-blue-600 text-lg" 
                              title="Facebook Access" 
                            />
                          )}
                          {submission.platformAccessAgreement && (
                            <FontAwesomeIcon 
                              icon={faCheck} 
                              className="text-green-500 text-sm" 
                              title="Platform Agreement Accepted" 
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[submission.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          <FontAwesomeIcon 
                            icon={statusMap[submission.status]?.icon || faClock} 
                            className="ml-1" 
                          />
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submissionDate || submission.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(submission._id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {submission.status === 'قيد المراجعة' && (
                            <>
                              <button
                                onClick={() => updateStatus(submission._id, 'مُعتمد')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="اعتماد"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button
                                onClick={() => updateStatus(submission._id, 'مرفوض')}
                                className="text-red-600 hover:text-red-900 transition-colors"
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchSubmissions(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => fetchSubmissions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    صفحة <span className="font-medium">{currentPage}</span> من{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchSubmissions(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return (
                        <button
                          key={page}
                          onClick={() => fetchSubmissions(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchSubmissions(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  تفاصيل طلب: {selectedSubmission.clinicName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم العيادة</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.clinicName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الطبيب</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.doctorName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {specialtyMap[selectedSubmission.specialty] || selectedSubmission.specialty}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.phoneNumber}</p>
                  </div>
                </div>

                {/* Platform Access Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">منصات التواصل الاجتماعي</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FontAwesomeIcon 
                        icon={faInstagram} 
                        className={`text-2xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-pink-500' : 'text-gray-400'}`}
                      />
                      <div>
                        <p className="text-sm font-medium">Instagram</p>
                        <p className={`text-xs ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تم التفعيل' : 'غير مفعل'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FontAwesomeIcon 
                        icon={faFacebook} 
                        className={`text-2xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-blue-600' : 'text-gray-400'}`}
                      />
                      <div>
                        <p className="text-sm font-medium">Facebook</p>
                        <p className={`text-xs ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تم التفعيل' : 'غير مفعل'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FontAwesomeIcon 
                        icon={selectedSubmission.platformAccessAgreement ? faCheck : faTimes} 
                        className={`text-2xl ml-3 ${selectedSubmission.platformAccessAgreement ? 'text-green-500' : 'text-red-500'}`}
                      />
                      <div>
                        <p className="text-sm font-medium">الموافقة على المنصات</p>
                        <p className={`text-xs ${selectedSubmission.platformAccessAgreement ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSubmission.platformAccessAgreement ? 'تمت الموافقة' : 'لم تتم الموافقة'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">معلومات الاتصال</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العيادة</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.googleMapsLink}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ساعات العمل</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.workingHours}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Account</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSubmission.gmailAccount}</p>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">الملفات المرفوعة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmission.logo && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon icon={faImage} className="text-blue-500 text-xl ml-3" />
                        <div>
                          <p className="text-sm font-medium">شعار العيادة</p>
                          <a 
                            href={selectedSubmission.logo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            عرض الملف
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedSubmission.pricingFile && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon icon={faFileDownload} className="text-green-500 text-xl ml-3" />
                        <div>
                          <p className="text-sm font-medium">ملف الأسعار</p>
                          <a 
                            href={selectedSubmission.pricingFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
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
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">تحديث الحالة</h4>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          updateStatus(selectedSubmission._id, 'مُعتمد');
                          setShowModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                        اعتماد
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(selectedSubmission._id, 'مرفوض');
                          setShowModal(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
  );
}
"use client"
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faTimes, faClipboardList, faSpinner, faHospital, faClock, faCircleCheck, faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import ProtectedRoute from '../../../components/ProtectedRoute';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SubmissionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/submissions/${id}`);
        const data = await response.json();
        if (data.success) {
          setSubmission(data.data);
        } else {
          setError('تعذر جلب تفاصيل الطلب');
        }
      } catch (err) {
        setError('خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-white">
        <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-500 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-blue-50">
        <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center">
          <FontAwesomeIcon icon={faTimes} className="text-5xl text-red-500 mb-6 animate-shake" />
          <p className="text-lg text-red-600 mb-6 font-semibold">{error}</p>
          <button onClick={() => router.back()} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold">رجوع</button>
        </div>
      </div>
    );
  }
  if (!submission) return null;

  // Status mapping
  const statusMap = {
    'قيد المراجعة': { color: 'bg-yellow-100 text-yellow-800', icon: faClock },
    'مُعتمد': { color: 'bg-green-100 text-green-800', icon: faCircleCheck },
    'مرفوض': { color: 'bg-red-100 text-red-800', icon: faCircleXmark }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white py-10" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => router.back()} className="mb-6 text-blue-600 hover:text-blue-900 font-bold text-lg">&larr; رجوع</button>
          <div className="bg-white/95 rounded-3xl shadow-2xl border-2 border-blue-100 p-8 animate-fadeIn">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faClipboardList} className="text-blue-500 text-3xl ml-2" />
              تفاصيل طلب: <span className="text-blue-600">{submission.clinicName}</span>
            </h2>
            {/* Images Row */}
            <div className="flex flex-wrap gap-6 justify-center mb-8">
              {(() => {
                const arabicLabels = {
                  logo: 'شعار العيادة',
                  frontDeskPhoto: 'صورة الاستقبال',
                  waitingRoomPhoto: 'صورة غرفة الانتظار',
                  signagePhoto: 'صورة اللافتة',
                  doctorPhotos: 'صور الأطباء',
                };
                return ['logo', 'frontDeskPhoto', 'waitingRoomPhoto', 'signagePhoto'].map((imgKey) => {
                  const val = submission[imgKey];
                  if (!val) return null;
                  return (
                    <div key={imgKey} className="flex flex-col items-center bg-white p-3 rounded-2xl shadow border border-blue-100">
                      <img src={val} alt={imgKey} className="max-h-40 rounded-xl shadow mb-2 border-2 border-blue-200" />
                      <span className="text-xs text-gray-600 font-bold mt-1">{arabicLabels[imgKey] || imgKey}</span>
                    </div>
                  );
                });
              })()}
              {/* Doctor Photos: show all in a row with nice UI */}
              {Array.isArray(submission.doctorPhotos) && submission.doctorPhotos.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-center w-full mt-4">
                  {submission.doctorPhotos.map((url, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-white p-3 rounded-2xl shadow border border-blue-200">
                      <img src={url} alt={`doctor-photo-${idx}`} className="h-32 w-32 object-cover rounded-xl shadow mb-2 border-2 border-blue-300" />
                      <span className="text-xs text-blue-700 font-bold mt-1">صورة طبيب #{idx + 1}</span>
                    </div>
                  ))}
                  <div className="w-full text-center mt-2">
                    <span className="text-sm text-gray-600 font-bold">{submission.doctorPhotos.length > 1 ? 'صور الأطباء' : 'صورة الطبيب'}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const arabicLabels = {
                  clinicName: 'اسم العيادة',
                  doctorName: 'الاسم الكامل للطبيب',
                  specialty: 'التخصص',
                  phoneNumber: 'رقم الهاتف',
                  clinicAddress: 'عنوان العيادة',
                  workingHours: 'ساعات العمل',
                  gmailAccount: 'حساب Gmail',
                  gmailPassword: 'كلمة مرور Gmail',
                  filmingDay: 'يوم التصوير',
                  contentApprover: 'من يوافق على المحتوى',
                  platformAccessAgreement: 'الموافقة على منح الصلاحيات',
                  pricingFile: 'ملف الأسعار',
                  clinicServices: 'خدمات العيادة',
                  doctorBio: 'معلومات الأطباء',
                  primaryColor: 'اللون الأساسي',
                  secondaryColor: 'اللون الثانوي',
                  accentColor: 'لون التمييز',
                  textColor: 'لون النص',
                  languages: 'اللغات',
                  gmbCategory: 'فئة Google My Business',
                  acceptPaidAds: 'الموافقة على إدارة الإعلانات المدفوعة',
                  confirmInfo: 'تأكيد صحة المعلومات',
                  agreeTerms: 'الموافقة على الشروط',
                  status: 'الحالة',
                  submissionDate: 'تاريخ الإيداع',
                };
                return Object.entries(submission).map(([key, value]) => {
                  // Hide unwanted fields
                  const hiddenFields = [
                    '_id', '__v', 'lastUpdated', 'createdAt', 'updatedAt', 'completionPercentage', 'instagramAccess', 'facebookAccess',
                    'logo', 'frontDeskPhoto', 'waitingRoomPhoto', 'signagePhoto', 'doctorPhotos'
                  ];
                  if (hiddenFields.includes(key)) return null;

                  // Special rendering for booleans
                  if (typeof value === "boolean") {
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <label className="block text-base font-bold text-gray-700 mb-2">{arabicLabels[key] || key}</label>
                        <span className={`inline-block px-4 py-2 rounded-xl font-bold text-white ${value ? 'bg-green-500' : 'bg-red-500'}`}>
                          {value ? 'نعم' : 'لا'}
                        </span>
                      </div>
                    );
                  }

                  // Color fields
                  if (key.toLowerCase().includes('color') && value) {
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <label className="block text-base font-bold text-gray-700 mb-2">{arabicLabels[key] || key}</label>
                        <span className="inline-block w-8 h-8 rounded-full border-2 border-gray-300 shadow" style={{ background: value }}></span>
                      </div>
                    );
                  }

                  // File links
                  if (key.toLowerCase().includes("file") && value) {
                    return (
                      <div key={key} className="col-span-2 flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl shadow-sm">
                        <label className="block text-base font-bold text-gray-700 mb-2 md:mb-0 md:w-1/4">{arabicLabels[key] || key}</label>
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-semibold">عرض الملف</a>
                      </div>
                    );
                  }

                  // Arrays
                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="col-span-2">
                        <label className="block text-base font-bold text-gray-700 mb-2">{arabicLabels[key] || key}</label>
                        <div className="flex flex-wrap gap-2">
                          {value.length > 0 ? value.map((v, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm font-bold">{v}</span>
                          )) : <span className="text-gray-400">-</span>}
                        </div>
                      </div>
                    );
                  }

                  // Format submissionDate as readable Latin (en-GB) date
                  if (key === 'submissionDate' && value) {
                    const date = new Date(value);
                    const formatted = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) +
                      ' - ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <div key={key}>
                        <label className="block text-base font-bold text-gray-700 mb-2">{arabicLabels[key]}</label>
                        <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{formatted}</p>
                      </div>
                    );
                  }
                  // Default
                  return (
                    <div key={key}>
                      <label className="block text-base font-bold text-gray-700 mb-2">{arabicLabels[key] || key}</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl shadow-sm font-semibold">{value?.toString() || "-"}</p>
                    </div>
                  );
                });
              })()}
            </div>
            {/* Status badge */}
            <div className="mt-8 flex items-center gap-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold shadow-sm ${statusMap[submission.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                <FontAwesomeIcon icon={statusMap[submission.status]?.icon || faClock} className="ml-2" />
                {submission.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

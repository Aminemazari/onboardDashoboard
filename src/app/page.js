"use client"

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket, faRoad, faPlayCircle, faCalendarWeek, faClipboardList, faGift,
  faHospital, faVideo, faRobot, faGlobe, faMapMarkerAlt, faAd, faCheckCircle,
  faPaperPlane, faQuestionCircle, faImage
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    clinicName: '',
    doctorName: '',
    specialty: '',
    phoneNumber: '',
    clinicAddress: '',
    workingHours: '',
    gmailAccount: '',
    gmailPassword: '',
    filmingDay: '',
    contentApprover: '',
    instagramAccess: false,
    facebookAccess: false,
    platformAccessAgreement: false,
    pricingFile: null,
    clinicServices: '', // Not required
    doctorBio: '', // Not required
  doctorPhotos: [], // Not required
    primaryColor: '#2563eb', // Not required
    secondaryColor: '#1e40af', // Not required
    accentColor: '#3b82f6', // Not required
    textColor: '#1f2937', // Not required
    logo: null, // Make logo required
    languages: [], // Not required
    frontDeskPhoto: null, // Not required
    waitingRoomPhoto: null, // Not required
    signagePhoto: null, // Not required
    gmbCategory: '', // Not required
    acceptPaidAds: false, // Make ad management required
    confirmInfo: false,
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when changing
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'languages') {
      setFormData((prev) => ({
        ...prev,
        languages: checked ? [value] : []
      }));
    } else {
      handleInputChange(e);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'doctorPhotos') {
      setFormData((prev) => ({ ...prev, doctorPhotos: Array.from(files) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files.length > 1 ? Array.from(files) : files[0] }));
    }
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

const validateForm = () => {
  const newErrors = {};

  if (!formData.clinicName) newErrors.clinicName = true;
  if (!formData.googleMapsLink) newErrors.googleMapsLink = 'يرجى إدخال رابط Google Maps';
  if (!formData.doctorName) newErrors.doctorName = true;
  if (!formData.specialty) newErrors.specialty = true;
  if (!formData.phoneNumber) newErrors.phoneNumber = true;
  if (!formData.clinicAddress) newErrors.clinicAddress = true;
  if (!formData.workingHours) newErrors.workingHours = true;
  if (!formData.gmailAccount) newErrors.gmailAccount = true;
  if (!formData.gmailPassword) newErrors.gmailPassword = true;
  if (!formData.filmingDay) newErrors.filmingDay = true;
  if (!formData.contentApprover) newErrors.contentApprover = true;
  if (!formData.platformAccessAgreement) newErrors.platformAccessAgreement = 'يجب الموافقة على استخدام منصاتك';
  if (!formData.pricingFile) newErrors.pricingFile = true;
  if (!formData.gmbCategory) newErrors.gmbCategory = true;
  if (!formData.confirmInfo) newErrors.confirmInfo = true;
  if (!formData.agreeTerms) newErrors.agreeTerms = true;
  if (!formData.logo) newErrors.logo = 'يرجى تحميل الشعار';
  if (!formData.acceptPaidAds) newErrors.acceptPaidAds = 'يجب الموافقة على إدارة الإعلانات المدفوعة';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  // Cloudinary upload function
  const uploadToCloudinary = async (file, folder = 'clinic-submissions') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'pdf_uploads'); // Replace with your actual preset name
    
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      // Use the correct endpoint based on file type
      const isImage = file.type.startsWith('image/');
      const endpoint = isImage 
        ? 'https://api.cloudinary.com/v1_1/ddidbfyvq/image/upload'
        : 'https://api.cloudinary.com/v1_1/ddidbfyvq/raw/upload';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }
      
      const data = await response.json();
      console.log('Uploaded file:', data);
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      return;
    }

    try {
      // Show uploading state
      alert('جاري رفع الملفات... يرجى الانتظار');
      
      // Upload files to Cloudinary first
      const uploadedData = { ...formData };
      
      // Upload logo
      if (formData.logo && formData.logo instanceof File) {
        uploadedData.logo = await uploadToCloudinary(formData.logo, 'logos');
      }
      
      // Upload pricing file
      if (formData.pricingFile && formData.pricingFile instanceof File) {
        uploadedData.pricingFile = await uploadToCloudinary(formData.pricingFile, 'pricing-files');
      }
      
      // Upload clinic photos
      if (formData.frontDeskPhoto && formData.frontDeskPhoto instanceof File) {
        uploadedData.frontDeskPhoto = await uploadToCloudinary(formData.frontDeskPhoto, 'clinic-photos');
      }
      
      if (formData.waitingRoomPhoto && formData.waitingRoomPhoto instanceof File) {
        uploadedData.waitingRoomPhoto = await uploadToCloudinary(formData.waitingRoomPhoto, 'clinic-photos');
      }
      
      if (formData.signagePhoto && formData.signagePhoto instanceof File) {
        uploadedData.signagePhoto = await uploadToCloudinary(formData.signagePhoto, 'clinic-photos');
      }
      
      // Upload doctor photos (multiple)
      if (formData.doctorPhotos && Array.isArray(formData.doctorPhotos) && formData.doctorPhotos.length > 0) {
        const uploadedDoctorPhotos = [];
        for (const file of formData.doctorPhotos) {
          if (file instanceof File) {
            const url = await uploadToCloudinary(file, 'doctor-photos');
            uploadedDoctorPhotos.push(url);
          }
        }
        uploadedData.doctorPhotos = uploadedDoctorPhotos;
      }
        
      // Now send only URLs and data to backend API (not FormData)
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadedData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowSuccess(true);
        console.log('Submission successful:', result);
      } else {
        console.error('Submission failed:', result);
        // Handle validation errors
        if (result.errors) {
          const newErrors = {};
          result.errors.forEach(error => {
            newErrors[error.field] = error.message;
          });
          setErrors(newErrors);
        } else {
          alert('حدث خطأ في إرسال النموذج: ' + (result.message || 'خطأ غير معروف'));
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    }
  };

  const handleDaySelection = (value) => {
    setFormData((prev) => ({ ...prev, filmingDay: value }));
    setErrors((prev) => ({ ...prev, filmingDay: false }));
  };

  const handleAddressDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text');
    if (text) {
      setFormData((prev) => ({ ...prev, clinicAddress: text }));
      setErrors((prev) => ({ ...prev, clinicAddress: false }));
    }
  };

  const handleAddressDragOver = (e) => {
    e.preventDefault();
  };

  const tutorialImages = [
    'https://picsum.photos/600/400?random=1',
    'https://picsum.photos/600/400?random=2',
    'https://picsum.photos/600/400?random=3'
  ];

  const handleVideoEmbed = (youtubeUrl) => {
    return (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/watch?v=CGyEd0aKWZE&list=RDTYy6r10vEmw&index=17"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  };

  const handleSmartAgentSetup = () => {
    return (
      <div>
        <h3>إعداد الوكيل الذكي</h3>
        <button onClick={() => alert('If you need Instagram service, please provide your Instagram credentials.')}>Instagram</button>
        <button onClick={() => alert('لإضافتي كمسؤول على صفحتك في فيسبوك، افتح صفحتك، انتقل إلى الإعدادات، ثم الأدوار الإدارية، وأضف بريدي الإلكتروني كمسؤول.')}>Facebook</button>
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.acceptSmartAgentInstructions}
              onChange={(e) => setFormData({ ...formData, acceptSmartAgentInstructions: e.target.checked })}
            />
            أوافق على التعليمات المذكورة أعلاه
          </label>
        </div>
      </div>
    );
  };



  return (
    <div className="bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <FontAwesomeIcon icon={faRocket} className="text-2xl" />
              <h1 className="text-2xl font-bold">Thrive Doc Onboarding Platform</h1>
            </div>
            <div className="text-sm">
              <span>الخطوة {currentStep} من {totalSteps}</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Visual Roadmap Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                <FontAwesomeIcon icon={faRoad} className="text-blue-600 ml-3" />
                خريطة رحلتك
              </h2>
              <p className="text-gray-600 text-lg">شاهد هذا الفيديو لفهم ما يحدث كل أسبوع وما نحتاجه منك</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/CGyEd0aKWZE?list=RDTYy6r10vEmw"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>

              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FontAwesomeIcon icon={faCalendarWeek} className="text-2xl text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">العمليات الأسبوعية</h3>
                <p className="text-sm text-gray-600">جدول زمني واضح لما يحدث كل أسبوع</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">متطلباتك</h3>
                <p className="text-sm text-gray-600">ما نحتاجه منك في كل مرحلة</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FontAwesomeIcon icon={faGift} className="text-2xl text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">ما ستحصل عليه</h3>
                <p className="text-sm text-gray-600">النتائج والتسليمات التي يمكنك توقعها</p>
              </div>
            </div>
          </section>

          {/* Clinic Information Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faHospital} className="text-blue-600 ml-3" />
              معلومات العيادة
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العيادة *</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.clinicName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.clinicName && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل للطبيب *</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.doctorName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.doctorName && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التخصص *</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.specialty ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">اختر التخصص</option>
                  <option value="dentist">طبيب أسنان</option>
                  <option value="dermatologist">طبيب جلدية</option>
                  <option value="cardiologist">طبيب قلب</option>
                  <option value="orthopedic">طبيب عظام</option>
                  <option value="ophthalmologist">طبيب عيون</option>
                  <option value="neurologist">طبيب أعصاب</option>
                  <option value="psychiatrist">طبيب نفسي</option>
                  <option value="other">آخر</option>
                </select>
                {errors.specialty && <p className="text-red-500 text-sm mt-1">يرجى اختيار التخصص</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العيادة الدقيق (لـ GMB والموقع الإلكتروني والخرائط) *</label>
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-blue-800 mb-2"><strong>كيفية تحديد العنوان:</strong></p>
                  <ol className="text-sm text-blue-700 space-y-1 mr-4">
                    <li>1. اذهب إلى <a href="https://maps.google.com" target="_blank" className="underline">Google Maps</a></li>
                    <li>2. ابحث عن عنوان عيادتك</li>
                    <li>3. انقر على الموقع الدقيق</li>
                    <li>4. انسخ العنوان الكامل</li>
                  </ol>
                </div>
                  <div>
                <label htmlFor="googleMapsLink">رابط Google Maps *</label>
                      <input
                        type="text"
                  id="googleMapsLink"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.googleMapsLink ? 'border-red-500' : 'border-gray-300'}`}

                        placeholder="Enter Google Maps link"
                        value={formData.googleMapsLink}
                        onChange={(e) =>
                          setFormData({ ...formData, googleMapsLink: e.target.value })
                        }
                      />
                {errors.googleMapsLink && <p className="text-red-500 text-sm mt-1">{errors.googleMapsLink}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل *</label>
                <input
                  type="text"
                  name="workingHours"
                  placeholder="مثال: الأحد-الخميس 9ص-6م، السبت 9ص-2م"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.workingHours ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.workingHours && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إنشاء حساب Gmail جديد *</label>
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-blue-800 mb-2"><strong>تعليمات:</strong></p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• اذهب إلى <a href="https://accounts.google.com" target="_blank" className="underline">accounts.google.com</a></li>
                    <li>• اختر "إنشاء حساب"</li>
                    <li>• استخدم اسم العيادة في عنوان البريد الإلكتروني</li>
                    <li>• مثال: clinicname@gmail.com</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <input
                    type="email"
                    name="gmailAccount"
                    placeholder="clinicname@gmail.com"
                    value={formData.gmailAccount}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.gmailAccount ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.gmailAccount && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
                  <input
                    type="password"
                    name="gmailPassword"
                    placeholder="كلمة المرور"
                    value={formData.gmailPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.gmailPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.gmailPassword && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Filming Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faVideo} className="text-blue-600 ml-3" />
              جدول التصوير
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">اختر يومًا في الأسبوع سنأتي فيه لتصوير 3 فيديوهات:</p>
              <div className={`grid grid-cols-7 gap-2 mb-4 ${errors.filmingDay ? 'border-red-500 border-2 rounded-lg p-2' : ''}`}>
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day, index) => (
                  <label
                    key={day}
                    className={`flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-all duration-300 ${formData.filmingDay === day ? 'bg-blue-600 text-white border-blue-600' : ''}`}
                    onClick={() => handleDaySelection(day)}
                  >
                    <input type="radio" name="filmingDay" value={day} className="sr-only" checked={formData.filmingDay === day} onChange={handleRadioChange} />
                    <span className="text-sm font-medium">
                      {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][index]}
                    </span>
                  </label>
                ))}
              </div>
              {errors.filmingDay && <p className="text-red-500 text-sm mt-1">يرجى اختيار يوم</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من يوافق على المحتوى؟ *</label>
              <input
                type="text"
                name="contentApprover"
                placeholder="الاسم ومعلومات الاتصال"
                value={formData.contentApprover}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.contentApprover ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.contentApprover && <p className="text-red-500 text-sm mt-1">يرجى ملء هذا الحقل</p>}
            </div>
          </section>

          {/* Social Media Platform Access Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faRobot} className="text-blue-600 ml-3" />
              إعداد منصات التواصل الاجتماعي
            </h2>
            <div className="space-y-6">
              {/* Facebook Access */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faFacebook} className="text-blue-600 text-2xl ml-3" />
                  <h3 className="text-lg font-bold text-gray-800">Facebook Page Access</h3>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 mb-2"><strong>المطلوب منك:</strong></p>
                  <ol className="text-sm text-blue-700 space-y-1 mr-4">
                    <li>1. يجب أن تمنحني صلاحية مسؤول كاملة على صفحة الفيسبوك الخاصة بعيادتك</li>
                    <li>2. اذهب إلى إعدادات الصفحة → أدوار الصفحة</li>
                    <li>3. أضفني كمسؤول باستخدام البريد الإلكتروني المقدم</li>
                    <li>4. هذا ضروري لإدارة المحتوى والإعلانات بشكل فعال</li>
                  </ol>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, facebookAccess: true }));
                    alert('لإضافتي كمسؤول على صفحتك في فيسبوك:\n\n1. افتح صفحة الفيسبوك الخاصة بعيادتك\n2. انتقل إلى الإعدادات\n3. اختر "أدوار الصفحة"\n4. انقر على "إضافة شخص إلى الصفحة"\n5. أدخل البريد الإلكتروني المقدم\n6. اختر "مسؤول" كدور\n7. انقر على "إضافة"\n\nسأتواصل معك لتقديم البريد الإلكتروني المحدد.');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                  تعليمات إضافة مسؤول Facebook
                </button>
              </div>

              {/* Instagram Access */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-2xl ml-3" />
                  <h3 className="text-lg font-bold text-gray-800">Instagram Account Access</h3>
                </div>
                <div className="bg-pink-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-pink-800 mb-2"><strong>المطلوب منك:</strong></p>
                  <ol className="text-sm text-pink-700 space-y-1 mr-4">
                    <li>1. يجب أن تزودني باسم المستخدم وكلمة المرور لحساب Instagram الخاص بعيادتك</li>
                    <li>2. سيتم استخدام هذه المعلومات لإدارة المحتوى والإعلانات</li>
                    <li>3. يفضل إنشاء حساب جديد مخصص للعيادة إذا لم يكن لديك</li>
                    <li>4. جميع بيانات الدخول ستكون آمنة ومحمية</li>
                  </ol>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, instagramAccess: true }));
                    alert('لمنحي إمكانية الوصول إلى حساب Instagram:\n\n1. إذا لم يكن لديك حساب Instagram للعيادة، قم بإنشاء واحد جديد\n2. تأكد من أن الحساب يمثل عيادتك بشكل احترافي\n3. ستحتاج لمشاركة اسم المستخدم وكلمة المرور معي\n4. يمكنك تغيير كلمة المرور لاحقاً بعد انتهاء المشروع\n5. سأتواصل معك لتقديم هذه المعلومات بشكل آمن');
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                  تعليمات الوصول إلى Instagram
                </button>
              </div>

              {/* Agreement Checkbox */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="platformAccessAgreement"
                    checked={formData.platformAccessAgreement}
                    onChange={handleCheckboxChange}
                    className={`w-5 h-5 border-2 rounded focus:ring-blue-600 mt-1 cursor-pointer checked:bg-blue-600 checked:border-blue-600 ${errors.platformAccessAgreement ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      أوافق على منح الصلاحيات المطلوبة لمنصات التواصل الاجتماعي *
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      يجب الموافقة على منح صلاحيات Facebook و Instagram لإتمام عملية التسجيل
                    </p>
                  </div>
                </div>
                {errors.platformAccessAgreement && <p className="text-red-500 text-sm mt-2 ml-8">{errors.platformAccessAgreement}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">أسعار الخدمات الطبية *</label>
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-green-800 mb-2"><strong>تعليمات:</strong></p>
                  <p className="text-sm text-green-700">قم بإنشاء ملف يحتوي على قائمة أسعار خدماتك بالطريقة المحددة. انقر على "تعلم كيف" لمعرفة الطريقة الصحيحة.</p>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-1">
                    <input
                      type="file"
                      name="pricingFile"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.pricingFile ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition duration-300"
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                    تعلم كيف
                  </button>
                </div>
                {errors.pricingFile && <p className="text-red-500 text-sm mt-1">يرجى تحميل الملف</p>}
                <p className="text-sm text-gray-500">اقبل ملفات PDF, Word, Excel</p>
              </div>
            </div>
          </section>

          {/* Website Development Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faGlobe} className="text-blue-600 ml-3" />
              تطوير الموقع الإلكتروني
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">خدمات العيادة</label>
                <textarea
                  name="clinicServices"
                  rows="4"
                  placeholder="اذكر جميع خدماتك"
                  value={formData.clinicServices}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">معلومات الأطباء والصور</label>
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-blue-800 mb-2"><strong>ما نحتاجه:</strong></p>
                  <ul className="text-sm text-blue-700 space-y-1 mr-4">
                    <li>• الاسم الكامل لكل طبيب</li>
                    <li>• التخصص والخبرة</li>
                    <li>• المؤهلات العلمية</li>
                    <li>• سنوات الخبرة</li>
                    <li>• صورة احترافية لكل طبيب</li>
                  </ul>
                </div>
                <textarea
                  name="doctorBio"
                  rows="4"
                  placeholder="اكتب معلومات مفصلة عن كل طبيب في العيادة..."
                  value={formData.doctorBio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">رفع صور الأطباء (يمكنك اختيار عدة صور)</label>
                  <input
                    type="file"
                    name="doctorPhotos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  {formData.doctorPhotos && Array.isArray(formData.doctorPhotos) && formData.doctorPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {formData.doctorPhotos.map((file, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-white p-2 rounded-xl shadow border border-blue-100">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`doctor-photo-${idx}`}
                            className="h-20 w-20 object-cover rounded-lg border-2 border-blue-200 mb-1"
                          />
                          <span className="text-xs text-gray-500 font-bold mt-1">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ألوان العلامة التجارية</label>
                  <div className="bg-purple-50 p-4 rounded-lg mb-3">
                    <p className="text-sm text-purple-800 mb-3"><strong>اختر ألوانك:</strong></p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="color"
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg cursor-pointer m-1 hover:scale-110 transition-transform duration-300"
                        title="اللون الأساسي"
                      />
                      <input
                        type="color"
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg cursor-pointer m-1 hover:scale-110 transition-transform duration-300"
                        title="اللون الثانوي"
                      />
                      <input
                        type="color"
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg cursor-pointer m-1 hover:scale-110 transition-transform duration-300"
                        title="لون التمييز"
                      />
                      <input
                        type="color"
                        name="textColor"
                        value={formData.textColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg cursor-pointer m-1 hover:scale-110 transition-transform duration-300"
                        title="لون النص"
                      />
                    </div>
                    <p className="text-xs text-purple-600 mt-2">انقر على كل مربع لاختيار اللون المناسب</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  {errors.logo && <span className="text-red-500 text-sm">{errors.logo}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اللغات للمحتوى المكتوب</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="languages"
                      value="arabic"
                      checked={formData.languages.includes('arabic')}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-blue-600 ml-3 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>العربية</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="languages"
                      value="french"
                      checked={formData.languages.includes('french')}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-blue-600 ml-3 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>الفرنسية</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="languages"
                      value="english"
                      checked={formData.languages.includes('english')}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-blue-600 ml-3 cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span>الإنجليزية</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Google My Business Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 ml-3" />
              Google My Business
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">صور العيادة</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      name="frontDeskPhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">طاولة الاستقبال</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      name="waitingRoomPhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">غرفة الانتظار</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      name="signagePhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">اللافتة</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                <select
                  name="gmbCategory"
                  value={formData.gmbCategory}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.gmbCategory ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">اختر الفئة</option>
                  <option value="dentiste">طبيب أسنان</option>
                  <option value="dermatologue">طبيب جلدية</option>
                  <option value="cardiologue">طبيب قلب</option>
                  <option value="orthopediste">طبيب عظام</option>
                  <option value="ophtalmologue">طبيب عيون</option>
                  <option value="neurologue">طبيب أعصاب</option>
                  <option value="psychiatre">طبيب نفسي</option>
                  <option value="other">آخر</option>
                </select>
                {errors.gmbCategory && <p className="text-red-500 text-sm mt-1">يرجى اختيار الفئة</p>}
              </div>
            </div>
          </section>

          {/* Paid Ads Management Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faAd} className="text-blue-600 ml-3" />
              إدارة الإعلانات المدفوعة (TikTok / FB / IG)
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptPaidAds"
                  checked={formData.acceptPaidAds}
                  onChange={handleCheckboxChange}
                  className={`w-5 h-5 border-2 rounded focus:ring-blue-600 mt-1 cursor-pointer checked:bg-blue-600 checked:border-blue-600 ${errors.acceptPaidAds ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">هل توافق على إدارة الإعلانات المدفوعة؟ *</label>
                  <p className="text-sm text-gray-500 mt-1">تأكيد قبولك لهذه الخدمة</p>
                </div>
              </div>
              {errors.acceptPaidAds && <p className="text-red-500 text-sm mt-2 ml-8">{errors.acceptPaidAds}</p>}
            </div>
          </section>

          {/* Final Confirmation Section */}
          <section className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 ml-3" />
              التأكيد النهائي
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="confirmInfo"
                  checked={formData.confirmInfo}
                  onChange={handleCheckboxChange}
                  className={`w-5 h-5 border-2 rounded focus:ring-blue-600 mt-1 cursor-pointer checked:bg-blue-600 checked:border-blue-600 ${errors.confirmInfo ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">أؤكد أن جميع المعلومات المقدمة صحيحة وكاملة *</label>
                  <p className="text-sm text-gray-500 mt-1">يرجى مراجعة جميع المعلومات قبل التأكيد</p>
                </div>
              </div>
              {errors.confirmInfo && <p className="text-red-500 text-sm mt-1 ml-8">يرجى التأكيد</p>}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleCheckboxChange}
                  className={`w-5 h-5 border-2 rounded focus:ring-blue-600 mt-1 cursor-pointer checked:bg-blue-600 checked:border-blue-600 ${errors.agreeTerms ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">أوافق على تقديم الموافقات والردود في الوقت المحدد كما هو مذكور في اتفاقيتنا *</label>
                  <p className="text-sm text-gray-500 mt-1">هذا يضمن تسليم المشروع بسلاسة</p>
                </div>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-sm mt-1 ml-8">يرجى التأكيد</p>}
            </div>
          </section>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="ml-3" />
              إرسال نموذج التسجيل
            </button>
          </div>
        </form>
      </main>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">شكراً لك!</h3>
            <p className="text-gray-600 mb-6">تم إرسال نموذج التسجيل بنجاح. سنراجع معلوماتك ونتواصل معك خلال 24 ساعة.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition duration-300"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Pricing Tutorial Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg max-h-[80vh] overflow-y-auto">
            <span className="text-2xl cursor-pointer float-left text-gray-500 hover:text-black" onClick={() => setShowPricingModal(false)}>&times;</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">كيفية إنشاء قائمة الأسعار</h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">الطريقة المطلوبة:</h3>
                <ol className="text-sm text-yellow-700 space-y-1 mr-4">
                  <li>1. افتح Microsoft Word أو Google Docs</li>
                  <li>2. أنشئ جدول منظم بالخدمات والأسعار</li>
                  <li>3. استخدم التنسيق المطلوب (سيتم توضيحه في الصور)</li>
                  <li>4. احفظ الملف بصيغة PDF أو Word</li>
                </ol>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-4">لقطات الشاشة التعليمية:</p>
                {tutorialImages.map((src, index) => (
                  <img key={index} src={src} alt={`Tutorial step ${index + 1}`} className="mb-4 rounded-lg shadow-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
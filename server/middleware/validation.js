const { body, validationResult } = require('express-validator');

// Validation rules for submission
const validateSubmission = [
  // Required text fields
  body('clinicName')
    .notEmpty()
    .withMessage('اسم العيادة مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم العيادة يجب أن يكون بين 2 و 100 حرف')
    .trim()
    .escape(),

  body('doctorName')
    .notEmpty()
    .withMessage('اسم الطبيب مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم الطبيب يجب أن يكون بين 2 و 100 حرف')
    .trim()
    .escape(),

  body('specialty')
    .notEmpty()
    .withMessage('التخصص مطلوب')
    .isIn(['dentist', 'dermatologist', 'cardiologist', 'orthopedic', 'ophthalmologist', 'neurologist', 'psychiatrist', 'other'])
    .withMessage('التخصص المحدد غير صحيح'),

  
body('phoneNumber')
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب')
    .matches(/^(07|05|06)[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 07 أو 05 أو 06 ويتبعه 8 أرقام'),

  body('workingHours')
    .notEmpty()
    .withMessage('ساعات العمل مطلوبة')
    .isLength({ min: 5, max: 200 })
    .withMessage('ساعات العمل يجب أن تكون بين 5 و 200 حرف')
    .trim(),

  body('gmailAccount')
    .notEmpty()
    .withMessage('حساب Gmail مطلوب')
    .isEmail()
    .withMessage('بريد إلكتروني غير صحيح')
    .matches(/^[^\s@]+@gmail\.com$/)
    .withMessage('يجب أن يكون بريد Gmail صحيح')
    .normalizeEmail(),

  body('gmailPassword')
    .notEmpty()
    .withMessage('كلمة مرور Gmail مطلوبة')
    .isLength({ min: 6, max: 100 })
    .withMessage('كلمة المرور يجب أن تكون على الأقل 6 أحرف'),

  body('filmingDay')
    .notEmpty()
    .withMessage('يوم التصوير مطلوب')
    .isIn(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
    .withMessage('يوم التصوير المحدد غير صحيح'),

  body('contentApprover')
    .notEmpty()
    .withMessage('معلومات موافق المحتوى مطلوبة')
    .isLength({ min: 2, max: 200 })
    .withMessage('معلومات موافق المحتوى يجب أن تكون بين 2 و 200 حرف')
    .trim()
    .escape(),

  body('gmbCategory')
    .notEmpty()
    .withMessage('فئة Google My Business مطلوبة')
    .trim()
    .escape(),

  // Platform access validation
  body('platformAccessAgreement')
    .equals('true')
    .withMessage('يجب الموافقة على استخدام منصات التواصل الاجتماعي'),

  // Boolean validations
  body('acceptPaidAds')
    .equals('true')
    .withMessage('يجب الموافقة على إدارة الإعلانات المدفوعة'),

  body('confirmInfo')
    .equals('true')
    .withMessage('يجب تأكيد صحة المعلومات'),

  body('agreeTerms')
    .equals('true')
    .withMessage('يجب الموافقة على الشروط والأحكام'),

  // Optional fields validation
  body('clinicServices')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('خدمات العيادة يجب أن تكون أقل من 2000 حرف')
    .trim(),

  body('doctorBio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('معلومات الطبيب يجب أن تكون أقل من 2000 حرف')
    .trim(),

  // Color validation
  body('primaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('اللون الأساسي يجب أن يكون بصيغة hex صحيحة'),

  body('secondaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('اللون الثانوي يجب أن يكون بصيغة hex صحيحة'),

  body('accentColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('لون التمييز يجب أن يكون بصيغة hex صحيحة'),

  body('textColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('لون النص يجب أن يكون بصيغة hex صحيحة'),

  // Languages validation
  body('languages')
    .optional()
    .custom((value) => {
      if (value && Array.isArray(value)) {
        const validLanguages = ['arabic', 'french', 'english'];
        return value.every(lang => validLanguages.includes(lang));
      }
      return true;
    })
    .withMessage('اللغات المحددة غير صحيحة')
];

// Status validation for update
const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('الحالة مطلوبة')
    .isIn(['قيد المراجعة', 'مُعتمد', 'مرفوض'])
    .withMessage('الحالة المحددة غير صحيحة')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: formattedErrors
    });
  }
  
  next();
};

// File validation middleware
const validateFiles = (req, res, next) => {
  const errors = [];
  
  // Check required files
  if (!req.files || !req.files.logo || req.files.logo.length === 0) {
    errors.push({
      field: 'logo',
      message: 'شعار العيادة مطلوب'
    });
  }
  
  if (!req.files || !req.files.pricingFile || req.files.pricingFile.length === 0) {
    errors.push({
      field: 'pricingFile',
      message: 'ملف الأسعار مطلوب'
    });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'ملفات مطلوبة مفقودة',
      errors: errors
    });
  }
  
  next();
};

module.exports = {
  validateSubmission,
  validateStatusUpdate,
  handleValidationErrors,
  validateFiles
};

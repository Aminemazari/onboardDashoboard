const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Required Fields
  clinicName: {
    type: String,
    required: [true, 'اسم العيادة مطلوب'],
    trim: true,
    maxlength: [100, 'اسم العيادة يجب أن يكون أقل من 100 حرف']
  },
  
  doctorName: {
    type: String,
    required: [true, 'اسم الطبيب مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الطبيب يجب أن يكون أقل من 100 حرف']
  },
  
  specialty: {
    type: String,
    required: [true, 'التخصص مطلوب'],
    enum: {
      values: ['dentist', 'dermatologist', 'cardiologist', 'orthopedic', 'ophthalmologist', 'neurologist', 'psychiatrist', 'other'],
      message: 'التخصص المحدد غير صحيح'
    }
  },
  
 phoneNumber: {
  type: String,
  required: [true, 'رقم الهاتف مطلوب'],
  validate: {
    validator: function(v) {
      // Lebanese phone number validation (07, 05, or 06 followed by 8 digits)
      return /^(07|05|06)[0-9]{8}$/.test(v.replace(/\s/g, ''));
    },
    message: 'رقم الهاتف يجب أن يبدأ بـ 07 أو 05 أو 06 ويتبعه 8 أرقام'
  }
},
    
  googleMapsLink: {
    type: String,
    required: [true, 'رابط Google Maps مطلوب'],
  },
  
  workingHours: {
    type: String,
    required: [true, 'ساعات العمل مطلوبة'],
    trim: true,
    maxlength: [200, 'ساعات العمل يجب أن تكون أقل من 200 حرف']
  },
  
  gmailAccount: {
    type: String,
    required: [true, 'حساب Gmail مطلوب'],
    validate: {
      validator: function(v) {
        return /^[^\s@]+@gmail\.com$/.test(v);
      },
      message: 'يجب أن يكون بريد Gmail صحيح'
    },
    lowercase: true,
    trim: true
  },
  
  gmailPassword: {
    type: String,
    required: [true, 'كلمة مرور Gmail مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف']
  },
  
  filmingDay: {
    type: String,
    required: [true, 'يوم التصوير مطلوب'],
    enum: {
      values: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      message: 'يوم التصوير المحدد غير صحيح'
    }
  },
  
  contentApprover: {
    type: String,
    required: [true, 'معلومات موافق المحتوى مطلوبة'],
    trim: true,
    maxlength: [200, 'معلومات موافق المحتوى يجب أن تكون أقل من 200 حرف']
  },

  // Platform Access - Updated to match new frontend structure
  instagramAccess: {
    type: Boolean,
    default: false
  },
  
  facebookAccess: {
    type: Boolean,
    default: false
  },
  
  platformAccessAgreement: {
    type: Boolean,
    required: [true, 'يجب الموافقة على استخدام منصات التواصل الاجتماعي'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'يجب الموافقة على استخدام منصات التواصل الاجتماعي'
    }
  },
  
  pricingFile: {
    type: String,
    required: [true, 'ملف الأسعار مطلوب']
  },
  
  gmbCategory: {
    type: String,
    required: [true, 'فئة Google My Business مطلوبة'],
    trim: true
  },
  
  logo: {
    type: String,
    required: [true, 'شعار العيادة مطلوب']
  },
  
  acceptPaidAds: {
    type: Boolean,
    required: [true, 'يجب الموافقة على إدارة الإعلانات المدفوعة'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'يجب الموافقة على إدارة الإعلانات المدفوعة'
    }
  },
  
  confirmInfo: {
    type: Boolean,
    required: [true, 'يجب تأكيد صحة المعلومات'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'يجب تأكيد صحة المعلومات'
    }
  },
  
  agreeTerms: {
    type: Boolean,
    required: [true, 'يجب الموافقة على الشروط والأحكام'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'يجب الموافقة على الشروط والأحكام'
    }
  },

  // Optional Fields
  clinicServices: {
    type: String,
    trim: true,
    maxlength: [2000, 'خدمات العيادة يجب أن تكون أقل من 2000 حرف']
  },
  
  doctorBio: {
    type: String,
    trim: true,
    maxlength: [2000, 'معلومات الطبيب يجب أن تكون أقل من 2000 حرف']
  },
  
  doctorPhotos: [{
    type: String
  }],
  
  primaryColor: {
    type: String,
    default: '#2563eb',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'اللون الأساسي يجب أن يكون بصيغة hex صحيحة'
    }
  },
  
  secondaryColor: {
    type: String,
    default: '#1e40af',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'اللون الثانوي يجب أن يكون بصيغة hex صحيحة'
    }
  },
  
  accentColor: {
    type: String,
    default: '#3b82f6',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'لون التمييز يجب أن يكون بصيغة hex صحيحة'
    }
  },
  
  textColor: {
    type: String,
    default: '#1f2937',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'لون النص يجب أن يكون بصيغة hex صحيحة'
    }
  },
  
  languages: [{
    type: String,
    enum: {
      values: ['arabic', 'french', 'english'],
      message: 'اللغة المحددة غير صحيحة'
    }
  }],
  
  frontDeskPhoto: {
    type: String
  },
  
  waitingRoomPhoto: {
    type: String
  },
  
  signagePhoto: {
    type: String
  },

  // System Fields
  status: {
    type: String,
    enum: ['قيد المراجعة', 'مُعتمد', 'مرفوض'],
    default: 'قيد المراجعة'
  },
  
  submissionDate: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate completion percentage
submissionSchema.pre('save', function(next) {
  const optionalFields = [
    'clinicServices', 'doctorBio', 'doctorPhotos', 'frontDeskPhoto', 
    'waitingRoomPhoto', 'signagePhoto'
  ];
  
  let filledOptionalFields = 0;
  optionalFields.forEach(field => {
  
 
    
  });
  
  this.completionPercentage = Math.round((filledOptionalFields / optionalFields.length) * 100);
  this.lastUpdated = new Date();
  next();
});

// Index for better query performance
submissionSchema.index({ clinicName: 1, specialty: 1, status: 1 });
submissionSchema.index({ submissionDate: -1 });

module.exports = mongoose.model('Submission', submissionSchema);

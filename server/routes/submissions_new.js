const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const {
  validateSubmission,
  validateStatusUpdate,
  handleValidationErrors
} = require('../middleware/validation');

// @route   POST /api/submissions
// @desc    Submit new clinic onboarding form with Cloudinary URLs
// @access  Public
router.post('/', validateSubmission, handleValidationErrors, async (req, res) => {
  try {
    // Process languages array if it exists
    let languages = [];
    if (req.body.languages) {
      if (Array.isArray(req.body.languages)) {
        languages = req.body.languages;
      } else if (typeof req.body.languages === 'string') {
        try {
          languages = JSON.parse(req.body.languages);
        } catch (e) {
          languages = [req.body.languages];
        }
      }
    }

    // Create submission data with Cloudinary URLs
    const submissionData = {
      clinicName: req.body.clinicName,
      doctorName: req.body.doctorName,
      specialty: req.body.specialty,
      phoneNumber: req.body.phoneNumber,
      clinicAddress: req.body.clinicAddress,
      googleMapsLink: req.body.googleMapsLink,
      workingHours: req.body.workingHours,
      gmailAccount: req.body.gmailAccount,
      gmailPassword: req.body.gmailPassword,
      filmingDay: req.body.filmingDay,
      contentApprover: req.body.contentApprover,
      
      // Platform access fields
      instagramAccess: req.body.instagramAccess === 'true' || req.body.instagramAccess === true,
      facebookAccess: req.body.facebookAccess === 'true' || req.body.facebookAccess === true,
      platformAccessAgreement: req.body.platformAccessAgreement === 'true' || req.body.platformAccessAgreement === true,
      
      // Optional fields
      clinicServices: req.body.clinicServices || '',
      doctorBio: req.body.doctorBio || '',
      primaryColor: req.body.primaryColor || '#2563eb',
      secondaryColor: req.body.secondaryColor || '#1e40af',
      accentColor: req.body.accentColor || '#3b82f6',
      textColor: req.body.textColor || '#1f2937',
      languages: languages,
      gmbCategory: req.body.gmbCategory || '',
      
      // Required checkboxes
      acceptPaidAds: req.body.acceptPaidAds === 'true' || req.body.acceptPaidAds === true,
      confirmInfo: req.body.confirmInfo === 'true' || req.body.confirmInfo === true,
      agreeTerms: req.body.agreeTerms === 'true' || req.body.agreeTerms === true,
      
      // File URLs (now coming from Cloudinary)
      logo: req.body.logo || '',
      pricingFile: req.body.pricingFile || '',
      frontDeskPhoto: req.body.frontDeskPhoto || '',
      waitingRoomPhoto: req.body.waitingRoomPhoto || '',
      signagePhoto: req.body.signagePhoto || '',
      doctorPhotos: req.body.doctorPhotos || '',
      
      status: 'قيد المراجعة',
      submissionDate: new Date()
    };

    // Create new submission
    const submission = new Submission(submissionData);
    await submission.save();

    res.status(201).json({
      success: true,
      message: 'تم إرسال النموذج بنجاح',
      data: {
        id: submission._id,
        clinicName: submission.clinicName,
        submissionDate: submission.submissionDate,
        status: submission.status
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/submissions
// @desc    Get all submissions with filtering and pagination
// @access  Public (should be protected in production)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.specialty) {
      filter.specialty = req.query.specialty;
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { clinicName: { $regex: req.query.search, $options: 'i' } },
        { doctorName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Submission.countDocuments(filter);

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-gmailPassword'); // Exclude sensitive data

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب البيانات'
    });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission details
// @access  Public (should be protected in production)
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .select('-gmailPassword'); // Exclude sensitive data

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل الطلب'
    });
  }
});

// @route   PUT /api/submissions/:id/status
// @desc    Update submission status
// @access  Public (should be protected in production)
router.put('/:id/status', validateStatusUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { status } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الحالة بنجاح',
      data: {
        id: submission._id,
        status: submission.status,
        lastUpdated: submission.lastUpdated
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الحالة'
    });
  }
});

// @route   GET /api/submissions/stats/overview
// @desc    Get submission statistics
// @access  Public (should be protected in production)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'قيد المراجعة'] }, 1, 0]
            }
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'مُعتمد'] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'مرفوض'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const overview = stats[0] || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    // Get specialty breakdown
    const specialtyStats = await Submission.aggregate([
      {
        $group: {
          _id: '$specialty',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview,
        specialtyBreakdown: specialtyStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
});

module.exports = router;

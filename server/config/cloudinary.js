const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to generate folder path based on submission ID and file type
const getFolderPath = (submissionId, fileType) => {
  const basePath = `clinic-submissions/${submissionId}`;
  
  switch (fileType) {
    case 'logo':
      return `${basePath}/logos`;
    case 'pricingFile':
      return `${basePath}/pricing`;
    case 'doctorPhotos':
      return `${basePath}/doctors`;
    case 'clinicPhotos':
      return `${basePath}/clinic-photos`;
    default:
      return basePath;
  }
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate submission ID for folder organization
    const submissionId = req.submissionId || Date.now().toString();
    req.submissionId = submissionId;
    
    // Determine file type based on field name
    let fileType = 'general';
    let allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
    switch (file.fieldname) {
      case 'logo':
        fileType = 'logo';
        allowedFormats = ['jpg', 'jpeg', 'png', 'gif'];
        break;
      case 'pricingFile':
        fileType = 'pricingFile';
        allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
        break;
      case 'doctorPhotos':
        fileType = 'doctorPhotos';
        allowedFormats = ['jpg', 'jpeg', 'png', 'gif'];
        break;
      case 'frontDeskPhoto':
      case 'waitingRoomPhoto':
      case 'signagePhoto':
        fileType = 'clinicPhotos';
        allowedFormats = ['jpg', 'jpeg', 'png', 'gif'];
        break;
    }
    
    return {
      folder: getFolderPath(submissionId, fileType),
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      public_id: `${file.fieldname}_${Date.now()}`,
      transformation: file.fieldname === 'logo' ? [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ] : file.fieldname.includes('Photo') ? [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ] : undefined
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى رفع صور (JPG, PNG, GIF) أو مستندات (PDF, DOC, DOCX, XLS, XLSX)'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files
  }
});

// Upload fields configuration
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'pricingFile', maxCount: 1 },
  { name: 'doctorPhotos', maxCount: 1 },
  { name: 'frontDeskPhoto', maxCount: 1 },
  { name: 'waitingRoomPhoto', maxCount: 1 },
  { name: 'signagePhoto', maxCount: 1 }
]);

// Helper function to delete files from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/);
  return matches ? matches[1] : null;
};

module.exports = {
  cloudinary,
  uploadFields,
  deleteFromCloudinary,
  extractPublicId,
  getFolderPath
};

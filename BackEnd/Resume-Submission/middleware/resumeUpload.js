const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk storage
// Files will be stored in req.file.buffer as binary data
const storage = multer.memoryStorage();

// File filter configuration
const fileFilter = (req, file, cb) => {
  console.log('File filter called with:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname, 'Type:', file.mimetype);
    cb(new Error(`Invalid file type. Only PDF and Word documents are allowed. Received: ${file.mimetype}`), false);
  }
};

// Create multer instance with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

// Enhanced middleware with better error handling
const singleUploadWithErrorHandling = (req, res, next) => {
  console.log('=== Multer Middleware Called ===');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);

  const singleUpload = upload.single('ResumeUpload');
  
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      
      let errorMessage = 'File upload error';
      let details = err.message;
      
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'File too large';
          details = 'File size must be less than 10MB';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'Too many files';
          details = 'Only one file is allowed';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'Unexpected field';
          details = 'File field name must be "ResumeUpload"';
          break;
        case 'LIMIT_PART_COUNT':
          errorMessage = 'Too many parts';
          details = 'Form has too many parts';
          break;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        details: details
      });
    } else if (err) {
      console.error('Upload Error:', err.message);
      return res.status(400).json({
        success: false,
        error: 'File upload failed',
        details: err.message
      });
    }
    
    // Log the result
    if (req.file) {
      console.log('File upload successful:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer.length,
        isBuffer: Buffer.isBuffer(req.file.buffer)
      });
    } else {
      console.log('No file uploaded in this request');
    }
    
    next();
  });
};

// Alternative middleware that makes file optional for updates
const optionalFileUpload = (req, res, next) => {
  console.log('=== Optional File Upload Middleware ===');
  console.log('Method:', req.method);
  console.log('Content-Type:', req.get('Content-Type'));
  
  // If it's not multipart/form-data, skip file processing
  if (!req.get('Content-Type') || !req.get('Content-Type').includes('multipart/form-data')) {
    console.log('Not multipart/form-data, skipping file upload');
    return next();
  }
  
  return singleUploadWithErrorHandling(req, res, next);
};

// Export methods
module.exports = {
  single: singleUploadWithErrorHandling,
  optional: optionalFileUpload,
  upload: upload
};
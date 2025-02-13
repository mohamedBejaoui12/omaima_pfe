const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log('Upload directory:', uploadDir); // Debug log

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Saving file to:', uploadDir); // Debug log
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('Original filename:', file.originalname); // Debug log
    console.log('User CIN:', req.user?.cin); // Debug log
    
    // Use CIN and timestamp for unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `profile-${req.user.cin}-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File mimetype:', file.mimetype); // Debug log
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    console.log('File rejected: not an image'); // Debug log
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err); // Debug log
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      console.error('Unknown upload error:', err); // Debug log
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: err.message
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;

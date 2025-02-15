const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Extract CIN from token if not already in req.user
    let cin = req.user?.cin;
    
    if (!cin) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          cin = decoded.cin;
        } catch (error) {
          console.error('Token verification error:', error);
        }
      }
    }

    // Fallback to random identifier if no CIN found
    cin = cin || 'unknown';

    // Use CIN and timestamp for unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `profile-${cin}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
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

// Middleware function
module.exports = function uploadMiddleware(req, res, next) {
  upload(req, res, function (err) {
    // Detailed error logging
    if (err) {
      console.error('Upload middleware error:', err);
      
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: err.message 
        });
      }
    }
    
    // If no file was uploaded, continue
    next();
  });
};

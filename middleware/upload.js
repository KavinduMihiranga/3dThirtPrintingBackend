const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/designs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `design-${Date.now()}-${Math.round(Math.random() * 1E9)}.glb`;
    console.log('Generated filename:', uniqueName);
    cb(null, uniqueName);
  }
});

// File filter to only accept GLB/GLTF files
const fileFilter = (req, file, cb) => {
  console.log('File mimetype:', file.mimetype);
  console.log('File originalname:', file.originalname);
  
  // Accept GLB files
  if (file.mimetype === 'model/gltf-binary' || 
      file.originalname.endsWith('.glb') ||
      file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only GLB files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit (increased for 3D models)
  },
  fileFilter: fileFilter
});


module.exports = upload;
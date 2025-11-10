const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    createDesignInquiry,
    getDesignInquiries,
    getDesignInquiryById,
    updateDesignInquiryStatus,
} = require('../controller/designInquiry.controller');

router.post('/', upload.single('designFile'), createDesignInquiry);
router.get('/', getDesignInquiries);
router.get('/:id', getDesignInquiryById);
router.put('/:id', updateDesignInquiryStatus);

module.exports = router;
// routes/contactUs.route.js
const express = require('express');
const router = express.Router();
const {
    getContactUsRequests,
    createContactUsRequest,
    getContactUsRequest,
    updateContactUsRequest,
    deleteContactUsRequest,
    
} = require('../controller/contactUs.controller');

router.get('/', getContactUsRequests);
router.post('/', createContactUsRequest);  
router.get('/:id', getContactUsRequest);
router.put('/:id', updateContactUsRequest);
router.delete('/:id', deleteContactUsRequest);

module.exports = router;
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/blogs', asyncHandler(blogController.listBlogs));
router.post('/blogs', asyncHandler(blogController.createBlog));
router.patch('/blogs/:id', asyncHandler(blogController.updateBlog));
router.delete('/blogs/:id', asyncHandler(blogController.deleteBlog));

module.exports = router;

const Blog = require('../models/Blog');

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

exports.listBlogs = async (req, res) => {
  const blogs = await Blog.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: blogs });
};

exports.createBlog = async (req, res) => {
  const { name, website, webstore, description, status, postsPerPage } = req.body;

  if (!name?.trim()) {
    throw buildError('Blog name is required.', 400);
  }

  const slug = (name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const blog = await Blog.create({
    name: name.trim(),
    slug,
    assignedTo: 'Any site / store',
    publicUrl: `/blog/${slug}`,
    website: website || '—',
    webstore: webstore || '—',
    description: description || '',
    status: status || 'active',
    postsPerPage: postsPerPage || 12,
    postList: [],
    categoryList: []
  });

  res.status(201).json({ success: true, data: blog });
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findOne({ _id: id, isDeleted: false });

  if (!blog) {
    throw buildError('Blog not found.', 404);
  }

  const allowedFields = ['name', 'website', 'webstore', 'description', 'status', 'postsPerPage', 'postList', 'categoryList'];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (updates.name) {
    updates.slug = (updates.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    updates.publicUrl = `/blog/${updates.slug}`;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, { $set: updates }, { new: true });
  res.status(200).json({ success: true, data: updatedBlog });
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });

  if (!blog) {
    throw buildError('Blog not found.', 404);
  }

  res.status(200).json({ success: true, data: { id: blog._id, deleted: true } });
};

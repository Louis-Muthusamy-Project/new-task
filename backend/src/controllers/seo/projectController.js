const { SeoProject, SeoHistory } = require('../../models');

// Helper to generate a slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, siteUrl, cms, targets, credentials, websiteId } = req.body;
    
    if (!name || !siteUrl) {
      return res.status(400).json({ error: 'Name and Site URL are required.' });
    }

    let slug = generateSlug(name);
    // Ensure slug uniqueness
    let existingProject = await SeoProject.findOne({ slug });
    let count = 1;
    while (existingProject) {
      slug = `${generateSlug(name)}-${count}`;
      existingProject = await SeoProject.findOne({ slug });
      count++;
    }

    const project = new SeoProject({
      name,
      slug,
      siteUrl,
      cms: cms || 'custom',
      targets: targets || {},
      credentials: credentials || {},
      websiteId: websiteId || null
    });

    await project.save();

    // Log to history
    const history = new SeoHistory({
      projectId: project._id,
      phase: 'intake',
      event: 'Client onboarded and project created',
      user: req.user ? req.user.username : 'System'
    });
    await history.save();

    res.status(201).json({ message: 'SEO Project created successfully.', project });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await SeoProject.find().select('-credentials.wpAppPassword -credentials.gscCredentials -credentials.ga4Credentials');
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Retrieve history log too
    const history = await SeoHistory.find({ projectId: project._id }).sort({ createdAt: -1 });

    res.json({ project, history });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Capture changes to history if phase or approvals change
    const oldPhase = project.phase;
    const oldApproval = project.approvals.strategyApproved;

    // Direct object assign
    Object.assign(project, updateData);
    project.updatedAt = Date.now();
    await project.save();

    let eventMsg = 'Project configuration updated';
    if (updateData.phase && updateData.phase !== oldPhase) {
      eventMsg = `Phase advanced from '${oldPhase}' to '${updateData.phase}'`;
    } else if (updateData.approvals && updateData.approvals.strategyApproved !== oldApproval) {
      eventMsg = updateData.approvals.strategyApproved ? 'Strategy approved by user (Gate 1 open)' : 'Strategy rejected / reset';
    }

    const history = new SeoHistory({
      projectId: project._id,
      phase: project.phase,
      event: eventMsg,
      user: req.user ? req.user.username : 'System'
    });
    await history.save();

    res.json({ message: 'Project updated successfully.', project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOneAndDelete({ slug });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Cleanup related models
    const { SeoAudit, SeoIssue, SeoKeyword, SeoCompetitor, SeoStrategy, SeoContent, SeoHistory } = require('../../models');
    await SeoAudit.deleteMany({ projectId: project._id });
    await SeoIssue.deleteMany({ projectId: project._id });
    await SeoKeyword.deleteMany({ projectId: project._id });
    await SeoCompetitor.deleteMany({ projectId: project._id });
    await SeoStrategy.deleteMany({ projectId: project._id });
    await SeoContent.deleteMany({ projectId: project._id });
    await SeoHistory.deleteMany({ projectId: project._id });

    res.json({ message: 'Project and all associated SEO records deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

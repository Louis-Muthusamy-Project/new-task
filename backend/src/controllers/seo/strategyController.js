const { SeoProject, SeoStrategy, SeoContent, SeoHistory } = require('../../models');
const strategyService = require('../../services/seo/StrategyService');
const aiService = require('../../services/seo/AIService');

exports.generateStrategy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const strategy = await strategyService.createStrategy(project);
    res.json({ message: 'Strategy generated successfully.', strategy });
  } catch (error) {
    next(error);
  }
};

exports.getStrategy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let strategy = await SeoStrategy.findOne({ projectId: project._id });
    if (!strategy) {
      // If it doesn't exist, auto create empty/draft strategy
      strategy = new SeoStrategy({ projectId: project._id });
      await strategy.save();
    }

    res.json(strategy);
  } catch (error) {
    next(error);
  }
};

exports.submitStrategy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const strategy = await SeoStrategy.findOne({ projectId: project._id });
    if (!strategy) {
      return res.status(404).json({ error: 'No strategy found to submit.' });
    }

    strategy.status = 'submitted';
    await strategy.save();

    res.json({ message: 'Strategy submitted for review.', strategy });
  } catch (error) {
    next(error);
  }
};

exports.approveStrategy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { username } = req.body; // Approved by username/email

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const strategy = await SeoStrategy.findOne({ projectId: project._id });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found.' });
    }

    strategy.status = 'approved';
    strategy.approvedBy = username || 'User';
    strategy.approvedAt = new Date();
    await strategy.save();

    // Advance project Gate 1
    project.approvals.strategyApproved = true;
    project.approvals.strategyApprovedBy = username || 'User';
    project.approvals.strategyApprovedAt = new Date();
    project.phase = 'implementation';
    if (!project.phasesCompleted.includes('strategy')) {
      project.phasesCompleted.push('strategy');
    }
    await project.save();

    // History Log
    const history = new SeoHistory({
      projectId: project._id,
      phase: 'strategy',
      event: `Strategy approved by ${username || 'User'}. Advancing to implementation phase (Gate 1 Open).`,
      user: username || 'User'
    });
    await history.save();

    // Pre-populate content drafts from contentPlan
    for (const plan of strategy.contentPlan) {
      try {
        const existContent = await SeoContent.findOne({ projectId: project._id, pageUrl: plan.pageUrl });
        if (!existContent) {
          const content = new SeoContent({
            projectId: project._id,
            pageUrl: plan.pageUrl,
            keyword: plan.keyword,
            existingPageId: plan.existingPageId,
            approvalStatus: 'draft'
          });
          await content.save();
        }
      } catch (err) {
        // Ignore duplicate pageUrl errors
      }
    }

    res.json({ message: 'Strategy approved and implementation phase initialized.', project, strategy });
  } catch (error) {
    next(error);
  }
};

exports.rejectStrategy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { notes, username } = req.body;

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const strategy = await SeoStrategy.findOne({ projectId: project._id });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found.' });
    }

    strategy.status = 'rejected';
    strategy.notes = notes || '';
    await strategy.save();

    // Reset Gate 1
    project.approvals.strategyApproved = false;
    project.approvals.strategyApprovedBy = null;
    project.approvals.strategyApprovedAt = null;
    project.phase = 'strategy';
    await project.save();

    // History Log
    const history = new SeoHistory({
      projectId: project._id,
      phase: 'strategy',
      event: `Strategy rejected by ${username || 'User'}. Notes: ${notes || 'none'}`,
      user: username || 'User'
    });
    await history.save();

    res.json({ message: 'Strategy rejected. Returned to strategy design phase.', project, strategy });
  } catch (error) {
    next(error);
  }
};

// Drafts workspaces CRUD
exports.getDrafts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const drafts = await SeoContent.find({ projectId: project._id });
    res.json(drafts);
  } catch (error) {
    next(error);
  }
};

exports.createDraft = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { pageUrl, keyword, draftTitle, draftBody, metaTitle, metaDescription } = req.body;

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const draft = new SeoContent({
      projectId: project._id,
      pageUrl,
      keyword,
      draftTitle,
      draftBody,
      metaTitle,
      metaDescription
    });

    await draft.save();
    res.status(201).json(draft);
  } catch (error) {
    next(error);
  }
};

exports.updateDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const draft = await SeoContent.findByIdAndUpdate(id, updateData, { new: true });
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }

    res.json({ message: 'Draft updated successfully.', draft });
  } catch (error) {
    next(error);
  }
};

exports.humanizeDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brandVoiceNotes } = req.body;

    const draft = await SeoContent.findById(id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }

    const humanizedBody = await aiService.humanizeText(draft.draftBody, brandVoiceNotes);
    draft.draftBody = humanizedBody;
    draft.brandNotes = brandVoiceNotes || '';
    await draft.save();

    res.json({ message: 'Draft humanized successfully.', draft });
  } catch (error) {
    next(error);
  }
};

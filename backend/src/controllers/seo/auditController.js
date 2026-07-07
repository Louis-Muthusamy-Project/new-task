const { SeoProject, SeoAudit, SeoIssue, SeoHistory } = require('../../models');
const auditService = require('../../services/seo/AuditService');

exports.triggerAudit = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Advance phase to audit
    project.phase = 'audit';
    if (!project.phasesCompleted.includes('intake')) {
      project.phasesCompleted.push('intake');
    }
    await project.save();

    // Call service asynchronously or synchronously (we'll start it synchronously/asynchronously)
    // To make this endpoint responsive, we trigger and return, but since we are demonstrating,
    // we can await a simulated or fast crawler response.
    // In production, we'd queue a background task. Here, let's run AuditService.
    const auditData = await auditService.runCrawlAndAudit(project);

    res.json({
      message: 'Audit completed successfully.',
      audit: auditData.audit,
      issuesCount: auditData.issues.length
    });
  } catch (error) {
    next(error);
  }
};

exports.getAudits = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const audits = await SeoAudit.find({ projectId: project._id }).sort({ createdAt: -1 });
    res.json(audits);
  } catch (error) {
    next(error);
  }
};

exports.getIssues = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { severity, status } = req.query;

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const filter = { projectId: project._id };
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const issues = await SeoIssue.find(filter).sort({ severity: 1, createdAt: -1 });
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'fixed', 'ignored'].includes(status)) {
      return res.status(400).json({ error: 'Invalid issue status.' });
    }

    const issue = await SeoIssue.findByIdAndUpdate(id, { status }, { new: true });
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    res.json({ message: 'Issue status updated successfully.', issue });
  } catch (error) {
    next(error);
  }
};

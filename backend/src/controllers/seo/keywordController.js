const { SeoProject, SeoKeyword, SeoCompetitor } = require('../../models');
const keywordService = require('../../services/seo/KeywordService');

exports.addKeywords = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { keywords } = req.body; // Array of strings or objects { keyword, intent }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords list must be a non-empty array.' });
    }

    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const keywordsAdded = [];
    for (const kw of keywords) {
      const keywordStr = typeof kw === 'string' ? kw.trim() : kw.keyword.trim();
      const intent = typeof kw === 'object' && kw.intent ? kw.intent : 'Unknown';
      
      try {
        // Try creating or ignore duplicate
        const item = new SeoKeyword({
          projectId: project._id,
          keyword: keywordStr,
          intent
        });
        await item.save();
        keywordsAdded.push(item);
      } catch (err) {
        // Keyword already tracked, ignore duplicate key error
        if (err.code !== 11000) {
          throw err;
        }
      }
    }

    res.status(201).json({
      message: `${keywordsAdded.length} keywords added to tracking.`,
      keywords: keywordsAdded
    });
  } catch (error) {
    next(error);
  }
};

exports.getKeywords = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const keywords = await SeoKeyword.find({ projectId: project._id }).sort({ position: 1, keyword: 1 });
    res.json(keywords);
  } catch (error) {
    next(error);
  }
};

exports.deleteKeyword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const keyword = await SeoKeyword.findByIdAndDelete(id);
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found.' });
    }
    res.json({ message: 'Keyword removed from tracking successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.refreshKeywordRanks = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Call service to scrape/pull DataForSEO data
    const updatedKeywords = await keywordService.refreshRanks(project);

    res.json({
      message: 'Keyword rankings updated successfully.',
      keywords: updatedKeywords
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompetitors = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await SeoProject.findOne({ slug });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let competitors = await SeoCompetitor.find({ projectId: project._id });
    
    // If empty, trigger auto discovery via KeywordService
    if (competitors.length === 0) {
      competitors = await keywordService.discoverCompetitors(project);
    }

    res.json(competitors);
  } catch (error) {
    next(error);
  }
};

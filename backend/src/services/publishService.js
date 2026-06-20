const Website = require('../models/Website');
const WebsitePage = require('../models/WebsitePage');
const WebsiteDomain = require('../models/WebsiteDomain');
const PublishHistory = require('../models/PublishHistory');


const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

/**
 * Resolves the public URL a published website will be served at.
 * Prefers a connected custom domain (if the website has one and it's
 * Connected); otherwise falls back to the platform's default subdomain
 * pattern.
 */
const resolvePublishUrl = async (website) => {
  if (website.domainId) {
    const domain = await WebsiteDomain.findOne({
      _id: website.domainId,
      status: 'Connected',
    });
    if (domain) {
      return `https://${domain.domain}`;
    }
  }

  const platformHost = process.env.PUBLISH_BASE_DOMAIN || 'sites.example.com';
  return `https://${website._id}.${platformHost}`;
};

/**
 * Builds the full website snapshot JSON that represents exactly what is
 * being published: website-level settings/tracking plus every page's
 * builder content, frozen at this point in time.
 */
const buildWebsiteSnapshot = (website, pages) => ({
  websiteId: website._id,
  // Website model uses `websiteName` (not `name`).
  name: website.websiteName,
  description: website.description,
  faviconUrl: website.faviconUrl,
  tracking: website.tracking,
  chatWidgetId: website.chatWidgetId,
  publishedAt: new Date().toISOString(),
  pages: pages.map((page) => ({
    pageId: page._id,
    name: page.name,
    slug: page.slug,
    isHome: page.isHome,
    seo: page.seo,
    content: page.content,
  })),
});


/**
 * Runs the full publish flow for a website:
 *   1. Fetch Website
 *   2. Fetch Website Pages
 *   3. Build Website Snapshot JSON
 *   4. Save PublishHistory
 *   5. Mark Website Published
 *
 * @param {string} websiteId
 * @param {string} triggeredBy - id of the user triggering the publish
 * @returns {Promise<{ publishUrl: string, website: object, publishHistory: object }>}
 */
const publishWebsite = async (websiteId, triggeredBy) => {
  // 1. Fetch Website
  const website = await Website.findOne({ _id: websiteId, isDeleted: false });
  if (!website) {
    throw notFoundError('Website not found.');
  }

  // 2. Fetch Website Pages
  const pages = await WebsitePage.find({ websiteId: website._id, isDeleted: false });

  // 3. Build Website Snapshot JSON
  const snapshot = buildWebsiteSnapshot(website, pages);

  const publishUrl = await resolvePublishUrl(website);

  let publishHistory;
  try {
    // 4. Save PublishHistory
    publishHistory = await PublishHistory.create({
      websiteId: website._id,
      pageId: null,
      action: 'publish',
      status: 'success',
      snapshot,
      triggeredBy,
    });

    // 5. Mark Website Published
    website.status = 'Published';
    await website.save();
  } catch (err) {
    await PublishHistory.create({
      websiteId: website._id,
      pageId: null,
      action: 'publish',
      status: 'failed',
      snapshot,
      errorMessage: err.message,
      triggeredBy,
    }).catch(() => {});
    throw err;
  }

  return { publishUrl, website, publishHistory };
};

module.exports = {
  publishWebsite,
  buildWebsiteSnapshot,
  resolvePublishUrl,
};

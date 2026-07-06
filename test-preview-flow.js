/**
 * Test: Trace complete StorePreviewModal rendering flow
 * 
 * Simulates what happens when StorePreviewModal receives the store home page
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Store = require('./backend/src/models/store/Store');
    const StorePage = require('./backend/src/models/store/StorePage');
    
    // Get the test store
    const storeId = new mongoose.Types.ObjectId("6a4617c9d416bb9eecbf895b");
    const store = await Store.findById(storeId).lean();
    
    console.log('='.repeat(80));
    console.log('STEP 1: Fetch store from previewStore endpoint');
    console.log('='.repeat(80));
    console.log('Store ID:', storeId.toString());
    console.log('Store name:', store.name);
    
    // Fetch pages
    const pages = await StorePage.find({
      storeId: store._id,
      isDeleted: { $ne: true },
    })
      .sort({ isHome: -1, createdAt: 1 })
      .lean();
    
    console.log('\nFetched', pages.length, 'pages');
    
    // STEP 2: Find home page
    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: Select home page in StorePreviewModal');
    console.log('='.repeat(80));
    
    const own = pages.find(p => p.isHome) || pages[0] || null;
    console.log('Found own home page:', own ? own.name + ' (id: ' + own._id.toString().slice(0,8) + ')' : 'NONE');
    
    if (!own) {
      console.log('ERROR: No home page found!');
      process.exit(1);
    }
    
    // STEP 3: Check if blank
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: Check isBlankContent');
    console.log('='.repeat(80));
    
    const isBlankContent = (content) => {
      if (!content) return true;
      if (typeof content === 'string') return !content.replace(/<[^>]*>/g, '').trim();
      if (typeof content === 'object') {
        const html = typeof content.html === 'string' ? content.html : '';
        return !html.replace(/<[^>]*>/g, '').trim();
      }
      return true;
    };
    
    const blank = isBlankContent(own.content);
    console.log('isBlankContent:', blank);
    console.log('Content object:', JSON.stringify(own.content, null, 2).slice(0, 300));
    
    if (blank) {
      console.log('Would use FALLBACK');
    } else {
      console.log('Would use own home page');
    }
    
    // STEP 4: Simulate buildPreviewHtml
    console.log('\n' + '='.repeat(80));
    console.log('STEP 4: buildPreviewHtml result');
    console.log('='.repeat(80));
    
    const content = own.content;
    const html = typeof content === 'string' ? content : (content.html || '');
    const css = typeof content === 'object' ? (content.css || '') : '';
    const headLinks = typeof content === 'object' ? (content.headLinks || '') : '';
    
    const hasDocumentShell = /<\s*(?:!doctype|html|head|body)\b/i.test(html);
    console.log('Has document shell:', hasDocumentShell);
    
    let srcDoc;
    if (!hasDocumentShell) {
      const styleBlock = css.trim() ? `<style>${css}</style>` : '';
      const headMarkup = [headLinks, styleBlock].filter(Boolean).join('\n');
      
      srcDoc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMarkup}
</head>
<body>
${html}
</body>
</html>`;
    } else {
      srcDoc = html; // Has document shell already
    }
    
    console.log('\nGenerated srcDoc (first 500 chars):');
    console.log(srcDoc.slice(0, 500));
    console.log('\n...');
    console.log(srcDoc.slice(-200));
    
    console.log('\nTotal srcDoc length:', srcDoc.length, 'chars');
    console.log('Contains "Aurora Desk Lamp":', srcDoc.includes('Aurora Desk Lamp'));
    console.log('Contains "featured-product":', srcDoc.includes('featured-product'));
    console.log('Contains data-store-block:', srcDoc.includes('data-store-block'));
    
    // STEP 5: What iframe would render
    console.log('\n' + '='.repeat(80));
    console.log('STEP 5: What iframe srcDoc contains');
    console.log('='.repeat(80));
    
    // Extract just the body content to see what the browser renders
    const bodyMatch = srcDoc.match(/<body>(.*)<\/body>/is);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1];
      const textContent = bodyContent.replace(/<[^>]*>/g, '').trim();
      console.log('\nText content after stripping HTML:');
      console.log(JSON.stringify(textContent));
    }
    
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();

require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Store = require('./src/models/store/Store');
    const StorePage = require('./src/models/store/StorePage');
    
    const storeId = new mongoose.Types.ObjectId('6a4617c9d416bb9eecbf895b');
    const store = await Store.findById(storeId).lean();
    
    const pages = await StorePage.find({
      storeId: store._id,
      isDeleted: { $ne: true },
    })
      .sort({ isHome: -1, createdAt: 1 })
      .lean();
    
    const own = pages.find(p => p.isHome) || pages[0] || null;
    
    console.log('================================================================================');
    console.log('STEP 1: Raw StorePage.content from MongoDB');
    console.log('================================================================================');
    console.log(JSON.stringify(own.content, null, 2));
    
    const content = own.content;
    const html = typeof content === 'string' ? content : (content.html || '');
    const css = typeof content === 'object' ? (content.css || '') : '';
    
    console.log('\n================================================================================');
    console.log('STEP 2: Extract html/css from content');
    console.log('================================================================================');
    console.log('HTML:', html);
    console.log('CSS:', css);
    
    const hasDocumentShell = /<\s*(?:!doctype|html|head|body)\b/i.test(html);
    console.log('Has document shell:', hasDocumentShell);
    
    let srcDoc;
    if (!hasDocumentShell) {
      const styleBlock = css.trim() ? `<style>${css}</style>` : '';
      srcDoc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${styleBlock}
</head>
<body>
${html}
</body>
</html>`;
    } else {
      srcDoc = html;
    }
    
    console.log('\n================================================================================');
    console.log('STEP 3: Final srcDoc passed to iframe');
    console.log('================================================================================');
    console.log(srcDoc);
    
    console.log('\n================================================================================');
    console.log('STEP 4: Check for Aurora Desk Lamp');
    console.log('================================================================================');
    console.log('Contains "Aurora Desk Lamp":', srcDoc.includes('Aurora Desk Lamp'));
    console.log('Contains "featured-product":', srcDoc.includes('featured-product'));
    console.log('Contains "data-store-block":', srcDoc.includes('data-store-block'));
    console.log('Contains "Ready for the":', srcDoc.includes('Ready for the'));
    
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();

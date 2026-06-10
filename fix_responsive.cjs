const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function fixFile(filepath) {
    const original = fs.readFileSync(filepath, 'utf8');
    let content = original;

    // Fix 1: Col flex styles for KPI cards
    // This regex looks for <Col ... style={{ flex: ... }}
    // and replaces the flex part to flex: '1 1 200px', minWidth: 200
    content = content.replace(
        /(<Col[^>]*?style=\{\{\s*)(.*?)flex:\s*[^,}]+(,?.*?\}\})/g,
        (match, p1, p2, p3) => {
            // Check if there are other styles
            const prefix = p2.trim() ? p2 : '';
            // if p3 starts with a comma, we don't need another comma if we append
            // we'll just replace the flex string entirely
            return `${p1}${prefix}flex: '1 1 200px', minWidth: 200${p3}`;
        }
    );

    // Fix 2: Add scroll={{ x: 'max-content' }} to Table tags
    content = content.replace(/<Table[^>]*>/g, (match) => {
        if (!match.includes('scroll=')) {
            if (match.endsWith('/>')) {
                return match.slice(0, -2) + " scroll={{ x: 'max-content' }} />";
            } else if (match.endsWith('>')) {
                return match.slice(0, -1) + " scroll={{ x: 'max-content' }}>";
            }
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed: ${path.basename(filepath)}`);
    }
}

fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.jsx')) {
        fixFile(path.join(pagesDir, file));
    }
});

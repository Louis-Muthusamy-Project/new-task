const isBlankContent = (content) => {
  if (!content) return true;
  if (typeof content === 'string') return !content.replace(/<[^>]*>/g, '').trim();
  if (typeof content === 'object') {
    const html = typeof content.html === 'string' ? content.html : '';
    return !html.replace(/<[^>]*>/g, '').trim();
  }
  return true;
};

const homeContent = { html: '<section class="hero"><h1>Welcome to your store</h1><p>Start customizing this page in the editor.</p></section>' };
const result = isBlankContent(homeContent);
console.log('isBlankContent result:', result);
console.log('Would trigger fallback logic:', !homeContent && result);
console.log('Text after strip tags:', homeContent.html.replace(/<[^>]*>/g, '').trim());

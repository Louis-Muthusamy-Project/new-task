function asString(value) {
  return typeof value === "string" ? value : "";
}

function hasDocumentShell(html) {
  return /<\s*(?:!doctype|html|head|body)\b/i.test(html);
}

function removeBlockingLoaders(documentHtml) {
  try {
    const doc = new DOMParser().parseFromString(documentHtml, "text/html");
    doc.documentElement.classList.add("loaded");
    doc.body?.classList.add("loaded");

    doc
      .querySelectorAll(
        [
          "#spinner",
          ".spinner",
          "#preloader",
          ".preloader",
          "#js-preloader",
          ".js-preloader",
          "#loader",
          ".loader",
          "[data-loader]",
          "[class~='loading-screen']",
          "[id~='loading-screen']",
        ].join(",")
      )
      .forEach((el) => el.remove());

    return `<!doctype html>\n${doc.documentElement.outerHTML}`;
  } catch (_) {
    return documentHtml;
  }
}

export function buildPreviewHtml(page = {}) {
  const content = page.content || {};
  const html = asString(content.html);
  const css = asString(content.css);
  const headLinks = asString(content.headLinks);

  const styleBlock = css.trim() ? `<style>${css}</style>` : "";
  const headMarkup = [headLinks, styleBlock].filter(Boolean).join("\n");

  if (hasDocumentShell(html)) {
    if (/<\/head>/i.test(html)) {
      return removeBlockingLoaders(html.replace(/<\/head>/i, `${headMarkup}\n</head>`));
    }

    return removeBlockingLoaders(html.replace(/<body\b/i, `<head>${headMarkup}</head><body`));
  }

  return removeBlockingLoaders(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMarkup}
</head>
<body>
${html}
</body>
</html>`);
}

export function openPagePreview(page) {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) return false;

  previewWindow.document.open();
  previewWindow.document.write(buildPreviewHtml(page));
  previewWindow.document.close();
  previewWindow.opener = null;
  return true;
}

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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}
function normalizePreviewContent(page = {}) {
  const content = page?.content;

  if (typeof content === "string") {
    return { html: content, css: "", headLinks: "" };
  }

  if (content && typeof content === "object") {
    return {
      html: asString(content.html),
      css: asString(content.css),
      headLinks: asString(content.headLinks),
    };
  }

  return {
    html: asString(page?.html),
    css: asString(page?.css),
    headLinks: asString(page?.headLinks),
  };
}
/**
 * Builds the floating chat-widget launcher + small details box that gets
 * injected into the previewed page when a chat widget is assigned to the
 * website. Pure inline HTML/CSS/JS so it can be dropped into any raw HTML
 * document without a build step.
 */
function buildChatWidgetSnippet(widget) {
  if (!widget) return "";

  const brandColor = widget.brandColor || "#3b82f6";
  const side = widget.launcherPosition === "Bottom left" ? "left" : "right";
  const name = escapeHtml(widget.name || "Chat");
  const type = escapeHtml(widget.type || "");
  const greeting = escapeHtml(widget.greeting || "Hi! How can we help you today?");
  const channels = Array.isArray(widget.channels) ? widget.channels : [];

  const channelChips = channels
    .map((channel) => {
      const chLabel = escapeHtml(channel);
      let href = "#";
      if (channel === "WhatsApp" && widget.whatsappPhone) {
        href = `https://wa.me/${escapeHtml(String(widget.whatsappPhone).replace(/[^0-9]/g, ""))}`;
      } else if (channel === "Email" && widget.supportEmail) {
        href = `mailto:${escapeHtml(widget.supportEmail)}`;
      }
      return `<a href="${href}" target="_blank" rel="noopener" style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;background:#f3f4f6;color:#111827;font-size:12px;font-weight:600;text-decoration:none;">${chLabel}</a>`;
    })
    .join("");

  return `
<div id="__cwLauncher" style="position:fixed;${side}:24px;bottom:24px;z-index:999999;width:56px;height:56px;border-radius:50%;background:${brandColor};box-shadow:0 6px 20px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;cursor:pointer;">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>
<div id="__cwBox" style="position:fixed;${side}:24px;bottom:92px;z-index:999999;width:280px;max-width:calc(100vw - 48px);background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,0.22);overflow:hidden;display:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="background:${brandColor};color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-weight:700;font-size:14px;">${name}</div>
      <div style="font-size:11px;opacity:0.85;margin-top:2px;">${type}</div>
    </div>
    <span id="__cwClose" style="cursor:pointer;font-size:16px;line-height:1;opacity:0.85;">&times;</span>
  </div>
  <div style="padding:14px 16px;">
    <div style="font-size:13px;color:#374151;line-height:1.5;margin-bottom:10px;">${greeting}</div>
    ${channelChips ? `<div>${channelChips}</div>` : ""}
  </div>
</div>
<script>
(function () {
  var launcher = document.getElementById('__cwLauncher');
  var box = document.getElementById('__cwBox');
  var closeBtn = document.getElementById('__cwClose');
  if (!launcher || !box) return;
  function toggle() {
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  }
  launcher.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    box.style.display = 'none';
  });
})();
</script>`;
}

export function buildPreviewHtml(page = {}, chatWidget = null) {
  const { html, css, headLinks } = normalizePreviewContent(page);

  const styleBlock = css.trim() ? `<style>${css}</style>` : "";
  const headMarkup = [headLinks, styleBlock].filter(Boolean).join("\n");
  const widgetMarkup = buildChatWidgetSnippet(chatWidget);

  if (hasDocumentShell(html)) {
    let result = /<\/head>/i.test(html)
      ? html.replace(/<\/head>/i, `${headMarkup}\n</head>`)
      : html.replace(/<body\b/i, `<head>${headMarkup}</head><body`);

    if (widgetMarkup) {
      result = /<\/body>/i.test(result)
        ? result.replace(/<\/body>/i, `${widgetMarkup}\n</body>`)
        : `${result}${widgetMarkup}`;
    }

    return removeBlockingLoaders(result);
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
${widgetMarkup}
</body>
</html>`);
}

const PREVIEW_STORAGE_PREFIX = "jeema_page_preview_";

function makePreviewId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {
    // fall through to the timestamp-based id below
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Reads back (without clearing) a preview payload staged by openPagePreview()
 * below, keyed by the id that was put in the /preview/page/:previewId URL.
 * Not cleared on read so refreshing the preview tab still works — it's
 * sessionStorage, so it's already scoped to this tab's session and goes
 * away on its own once the tab closes.
 */
export function readStagedPreviewHtml(previewId) {
  if (!previewId) return null;
  try {
    return sessionStorage.getItem(PREVIEW_STORAGE_PREFIX + previewId);
  } catch (_) {
    return null;
  }
}

export function openPagePreview(page, chatWidget = null) {
  const previewId = makePreviewId();

  try {
    sessionStorage.setItem(PREVIEW_STORAGE_PREFIX + previewId, buildPreviewHtml(page, chatWidget));
  } catch (e) {
    console.warn("[previewHtml] could not stage preview payload:", e);
    return false;
  }

  // Deliberately no "noopener" here: sessionStorage is only inherited by a
  // new tab when it's opened as an auxiliary browsing context of this one
  // (same origin), and "noopener" would break that relationship before the
  // new tab gets a chance to read what was just staged above. We still cut
  // the opener reference ourselves right after, for the same safety benefit
  // "noopener" would have given us, without the timing problem.
  const previewWindow = window.open(`/preview/page/${previewId}`, "_blank");
  if (!previewWindow) return false;
  previewWindow.opener = null;
  return true;
}
import React, { useState } from 'react';

// ChatWidgetLauncher.jsx
//
// previewHtml.js's buildChatWidgetSnippet() builds the same launcher as a
// raw HTML string with an inline <script> for the open/close toggle — fine
// for an `srcDoc` iframe (a full, independent document that executes its
// own scripts), but a <script> tag inside `dangerouslySetInnerHTML` never
// runs in a normal React tree. WebsitePagePreview's live path renders
// in-page (not an iframe) so the components below it can be real, mounted
// React — this is the same launcher, reimplemented as one, so the chat
// widget still shows up and still works once a page is live-rendered.
export default function ChatWidgetLauncher({ widget }) {
  const [open, setOpen] = useState(false);
  if (!widget) return null;

  const brandColor = widget.brandColor || '#3b82f6';
  const side = widget.launcherPosition === 'Bottom left' ? 'left' : 'right';
  const channels = Array.isArray(widget.channels) ? widget.channels : [];

  const channelHref = (channel) => {
    if (channel === 'WhatsApp' && widget.whatsappPhone) {
      return `https://wa.me/${String(widget.whatsappPhone).replace(/[^0-9]/g, '')}`;
    }
    if (channel === 'Email' && widget.supportEmail) return `mailto:${widget.supportEmail}`;
    return '#';
  };

  return (
    <>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed', [side]: 24, bottom: 24, zIndex: 999999,
          width: 56, height: 56, borderRadius: '50%', background: brandColor,
          boxShadow: '0 6px 20px rgba(0,0,0,0.28)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      {open && (
        <div
          style={{
            position: 'fixed', [side]: 24, bottom: 92, zIndex: 999999,
            width: 280, maxWidth: 'calc(100vw - 48px)', background: '#fff',
            borderRadius: 14, boxShadow: '0 10px 40px rgba(0,0,0,0.22)', overflow: 'hidden',
            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
          }}
        >
          <div style={{ background: brandColor, color: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{widget.name || 'Chat'}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{widget.type || ''}</div>
            </div>
            <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', fontSize: 16, lineHeight: 1, opacity: 0.85 }}>&times;</span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>
              {widget.greeting || 'Hi! How can we help you today?'}
            </div>
            {channels.length > 0 && (
              <div>
                {channels.map((channel) => (
                  <a
                    key={channel}
                    href={channelHref(channel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', margin: '0 6px 6px 0', padding: '6px 12px',
                      borderRadius: 999, background: '#f3f4f6', color: '#111827',
                      fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    {channel}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

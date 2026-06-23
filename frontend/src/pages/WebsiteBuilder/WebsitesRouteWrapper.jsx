import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { websiteWizardApi } from '../../api/websiteWizardApi';
import BccBuilder from './websiteWizard/BccBuilder';

/**
 * WebsitesRouteWrapper
 *
 * Handles /websites/:websiteId  (no pageId in URL).
 * Looks up the website's pages and redirects to the first/home page
 * using the CANONICAL route: /websites/:websiteId/pages/:pageId
 *
 * BccBuilder reads { websiteId, pageId } from useParams(), which matches
 * the param names in App.jsx, so browser refresh always works correctly.
 */
const WebsitesRouteWrapper = () => {
  const { websiteId, pageId } = useParams();
  const navigate = useNavigate();

  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPagesAndRedirect = async () => {
      if (pageId) return; // BccBuilder route will handle page-specific loading

      setError(null);
      setPages(null);

      try {
        const resp = await websiteWizardApi.listPagesByWebsite(websiteId);
        const list = Array.isArray(resp) ? resp : resp?.data;
        if (cancelled) return;
        const safePages = Array.isArray(list) ? list : [];
        setPages(safePages);

        if (!safePages.length) {
          // No pages found — nothing to redirect to; stay and show an informative error.
          setError('This website has no pages yet. Go back and add a page first.');
          return;
        }

        const first = safePages.find((p) => p.isHome) || safePages[0];

        // FIX: Safe pageId resolution: _id || id || slug
        const firstPageId = first?._id || first?.id || first?.slug;

        if (!firstPageId) {
          setError('Could not resolve a page ID for this website.');
          return;
        }

        // FIX: Use canonical route /websites/:websiteId/pages/:pageId
        console.log('[EDIT NAVIGATION]', websiteId, firstPageId);
        navigate(`/websites/${websiteId}/pages/${firstPageId}`, { replace: true });
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load pages');
      }
    };

    loadPagesAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [navigate, pageId, websiteId]);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Failed to load pages"
        description={error}
        style={{ margin: 24 }}
      />
    );
  }

  // If pageId exists, render BccBuilder immediately.
  // (This wrapper is primarily for the /websites/:websiteId case.)
  if (pageId) {
    return <BccBuilder />;
  }

  // pageId missing: we are redirecting; show a loader.
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  );
};

export default WebsitesRouteWrapper;
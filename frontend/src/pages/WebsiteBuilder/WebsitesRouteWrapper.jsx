import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { websiteWizardApi } from '../../api/websiteWizardApi';
import BccBuilder from './websiteWizard/BccBuilder';

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
          // No pages to redirect to; stay and let BccBuilder show its own loader/error
          // by navigating to an empty editor-like state.
          // We still avoid blank routes by routing to BccBuilder with a dummy id.
          navigate(`/websites/${websiteId}/pages/`, { replace: true });
          return;
        }

        const first = safePages.find((p) => p.isHome) || safePages[0];
        if (!first?._id && !first?.id) return;

        const firstPageId = first._id || first.id;
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


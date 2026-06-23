import { useEffect } from 'react';

// React hook: warns when user tries to close/refresh with unsaved changes.
export default function useUnsavedChangesWarning(shouldWarn) {
  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (e) => {
      // Standard beforeunload
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldWarn]);
}


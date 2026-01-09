import { useEffect } from 'react';

export const usePageTitle = (title, subtitle = '') => {
  useEffect(() => {
    const baseTitle = 'Catalog Calculator';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
    
    // Update meta description if subtitle provided
    if (subtitle) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', subtitle);
      }
    }
  }, [title, subtitle]);

  return { title, subtitle };
};
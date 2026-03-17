import React, { useEffect, useState } from 'react';

const LegacyUI = ({ page }) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = page ? `/${page}` : '/index';
    fetch(url)
      .then(res => res.text())
      .then(data => {
        setHtml(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load legacy page:', err);
        setLoading(false);
      });
  }, [page]);

  if (loading) return <div>Loading...</div>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default LegacyUI;
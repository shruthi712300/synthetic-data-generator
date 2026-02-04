import React, { useEffect } from 'react';

export default function LegacyUI({ page = "index.html" }) {
  // Handle navigation from iframe to React routes
  useEffect(() => {
    const handleMessage = (event) => {
      // Listen for navigation messages from iframe
      if (event.data && event.data.type === 'NAVIGATE') {
        // Get the React Router's history/navigate function
        window.location.href = event.data.path;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={`/ui-code/templates/${page}`}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block"
        }}
        title={page}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
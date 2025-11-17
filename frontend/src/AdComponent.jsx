import React, { useEffect, useRef } from 'react';

const AdComponent = ({ adKey, width, height }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Prevent re-injecting the script
    if (adRef.current && adRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(invokeScript);
    }
  }, [adKey, width, height]);

  return <div ref={adRef} style={{ display: 'flex', justifyContent: 'center', margin: '20px auto' }} />;
};

export default AdComponent;

import React, { useEffect, useRef } from 'react';

const AdComponent = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '76c30e6631e256ef38ab65c1ce40cee8',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      adRef.current.appendChild(configScript);

      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.src = '//www.highperformanceformat.com/76c30e6631e256ef38ab65c1ce40cee8/invoke.js';
      adRef.current.appendChild(adScript);
    }
  }, []);

  return <div ref={adRef} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} />;
};

export default AdComponent;

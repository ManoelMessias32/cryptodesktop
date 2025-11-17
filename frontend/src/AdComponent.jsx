import React, { useEffect, useRef } from 'react';

const AdComponent = ({ adKey, width, height }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Garante que o script seja inserido apenas uma vez.
    if (adRef.current) {
        // Limpa qualquer conteúdo anterior para evitar duplicatas
        adRef.current.innerHTML = '';

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
  }, [adKey, width, height]); // A dependência garante que o anúncio recarregue se a key mudar

  return <div ref={adRef} style={{ display: 'flex', justifyContent: 'center', margin: '20px auto' }} />;
};

export default AdComponent;

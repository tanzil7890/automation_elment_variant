import { NextResponse } from 'next/server';

export async function GET() {
  // JavaScript code for the integration script
  const script = `
(function() {
  // Element Variants integration
  const ElementVariants = {
    apiKey: '',
    baseUrl: '',
    initialized: false,
    
    // Initialize the integration
    init: function() {
      try {
        // Get script attributes
        const scriptTag = document.currentScript || (function() {
          const scripts = document.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].getAttribute('data-api-key')) {
              return scripts[i];
            }
          }
          return null;
        })();
        
        if (!scriptTag) {
          console.error('Element Variants: Could not find script tag with data-api-key attribute');
          return;
        }
        
        // Extract API key and base URL
        this.apiKey = scriptTag.getAttribute('data-api-key');
        this.baseUrl = scriptTag.src.split('/api/')[0];
        
        if (!this.apiKey) {
          console.error('Element Variants: Missing API key');
          return;
        }
        
        // Set initialized flag
        this.initialized = true;
        
        // Get the variants for this page
        this.fetchVariants();
      } catch (error) {
        console.error('Element Variants: Initialization error', error);
      }
    },
    
    // Fetch variants from the API
    fetchVariants: function() {
      if (!this.initialized) {
        return;
      }
      
      try {
        // Gather context data
        const context = {
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          timestamp: new Date().toISOString()
        };
        
        // Fetch variants from API
        fetch(\`\${this.baseUrl}/api/integration/variants\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify(context)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Apply variants
          this.applyVariants(data.variants);
        })
        .catch(error => {
          console.error('Element Variants: Error fetching variants', error);
        });
      } catch (error) {
        console.error('Element Variants: Error in fetchVariants', error);
      }
    },
    
    // Apply variants to the page
    applyVariants: function(variants) {
      if (!variants || !Array.isArray(variants)) {
        return;
      }
      
      try {
        variants.forEach(variant => {
          // Find the element using the selector
          const elements = document.querySelectorAll(variant.selector);
          
          if (elements.length === 0) {
            console.warn(\`Element Variants: No elements found for selector \${variant.selector}\`);
            return;
          }
          
          // Apply the content to all matching elements
          elements.forEach(element => {
            element.innerHTML = variant.content;
          });
        });
      } catch (error) {
        console.error('Element Variants: Error applying variants', error);
      }
    }
  };
  
  // Initialize the integration
  ElementVariants.init();
})();
  `;
  
  // Return the script with proper JavaScript MIME type
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      // Cache for 1 hour (3600 seconds)
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface WebsiteData {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
}

export default function WebsiteCodePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Fetch website data
  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        if (status === 'unauthenticated') {
          router.push('/login');
          return;
        }
        
        if (status === 'loading') {
          return;
        }
        
        const response = await fetch(`/api/websites/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/dashboard/websites');
            return;
          }
          
          throw new Error('Failed to fetch website');
        }
        
        const data = await response.json();
        setWebsite(data);
      } catch (error) {
        console.error('Error fetching website:', error);
        setError('Failed to load website. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebsite();
  }, [params.id, router, status]);
  
  const handleCopyCode = () => {
    if (!website) return;
    
    const code = getIntegrationCode(website.apiKey);
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  const getIntegrationCode = (apiKey: string) => {
    return `<!-- Element Variants Integration -->
<script>
  (function() {
    var ev = document.createElement('script');
    ev.type = 'text/javascript';
    ev.async = true;
    ev.src = '${window.location.origin}/api/integration/widget.js';
    ev.setAttribute('data-api-key', '${apiKey}');
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ev);
  })();
</script>
<!-- End Element Variants Integration -->`;
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  // Show error if website not found
  if (!website && !loading) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'Website not found'}</p>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/websites"
                className="text-sm font-medium text-red-800 underline"
                aria-label="Return to websites list"
              >
                Return to Websites
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integration Code</h1>
        <Link
          href={`/dashboard/websites/${params.id}`}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Return to website details"
        >
          Back to Website
        </Link>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-lg font-medium text-gray-900">
          Integration Snippet for {website?.name}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Add this code to your website just before the closing <code className="font-mono text-indigo-600">&lt;/body&gt;</code> tag
          to enable content variants.
        </p>
        
        <div className="mt-4">
          <div className="relative">
            <pre className="mt-2 overflow-x-auto rounded-md bg-gray-800 p-4 text-sm text-white">
              <code>{website && getIntegrationCode(website.apiKey)}</code>
            </pre>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`absolute top-2 right-2 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
              aria-label="Copy integration code"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-lg font-medium text-gray-900">Implementation Instructions</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">1. Add the snippet to your website</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Copy the snippet above and paste it just before the closing <code className="font-mono">&lt;/body&gt;</code> tag
                    in your website&apos;s HTML.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">2. Create elements and variants</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Go back to your website and add elements using CSS selectors. Then create variants and
                    set conditions for when they should display.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">3. Test your variants</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Visit your website with different conditions to test that your content variants
                    are displaying correctly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Technical Details</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The integration snippet loads asynchronously and will not block your page from loading.
                It communicates with our API to fetch the appropriate content variants based on the user&apos;s
                context and your defined conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
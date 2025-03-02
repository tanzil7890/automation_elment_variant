'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface WebsiteData {
  id: string;
  name: string;
  domain: string;
  active: boolean;
}

export default function EditWebsitePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
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
        setName(data.name);
        setDomain(data.domain);
        setActive(data.active);
      } catch (error) {
        console.error('Error fetching website:', error);
        setError('Failed to load website. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchWebsite();
  }, [params.id, router, status]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !domain) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/websites/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, domain, active }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to update website');
        return;
      }
      
      // Redirect to website detail page
      router.push(`/dashboard/websites/${params.id}`);
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error updating website:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone and will remove all associated elements and variants.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/websites/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete website');
        return;
      }
      
      // Redirect to websites list
      router.push('/dashboard/websites');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error deleting website:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while fetching website data
  if (fetchLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading website data...</p>
      </div>
    );
  }
  
  // Show error if website not found
  if (!website && !fetchLoading) {
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
        <h1 className="text-2xl font-bold">Edit Website</h1>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/websites/${params.id}`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Cancel and return to website details"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Delete website"
          >
            Delete
          </button>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Website Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-label="Website name"
            />
          </div>
          
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-label="Website domain"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the domain without http:// or https:// (e.g., example.com)
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Active status"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (content variants will only be served for active websites)
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              aria-label="Save changes"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
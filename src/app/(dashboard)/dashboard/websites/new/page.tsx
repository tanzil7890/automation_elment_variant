'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewWebsitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, domain }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to create website');
        return;
      }
      
      // Redirect to websites list
      router.push('/dashboard/websites');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error creating website:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Website</h1>
        <Link
          href="/dashboard/websites"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Cancel and return to websites list"
        >
          Cancel
        </Link>
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
              placeholder="My Website"
              required
              aria-label="Website name"
            />
            <p className="mt-1 text-sm text-gray-500">
              A descriptive name to identify your website
            </p>
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
              placeholder="example.com"
              required
              aria-label="Website domain"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the domain without http:// or https:// (e.g., example.com)
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              aria-label="Add website"
            >
              {loading ? 'Adding...' : 'Add Website'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                After adding your website, you&apos;ll be able to create elements and their content variants.
                You&apos;ll then receive a JavaScript snippet to add to your website which will enable personalized content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
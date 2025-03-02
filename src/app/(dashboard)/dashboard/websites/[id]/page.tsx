import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Website Details - Element Variants',
  description: 'View and manage your website details',
};

// Fetch website data by ID
async function getWebsite(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return null;
    }
    
    const website = await prisma.website.findUnique({
      where: {
        id,
      },
      include: {
        elements: {
          include: {
            variants: true,
          },
        },
      },
    });
    
    // Check if website exists and belongs to the user
    if (!website || website.userId !== session.user.id) {
      return null;
    }
    
    return website;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

export default async function WebsiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const website = await getWebsite(params.id);
  
  // If website not found or doesn't belong to the user
  if (!website) {
    notFound();
  }
  
  // Calculate statistics
  const elementCount = website.elements.length;
  const variantCount = website.elements.reduce(
    (count, element) => count + element.variants.length,
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{website.name}</h1>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/websites/${website.id}/edit`}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            aria-label={`Edit ${website.name}`}
          >
            Edit
          </Link>
          <Link
            href={`/dashboard/websites/${website.id}/elements/new`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Add new element"
          >
            Add Element
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Website Details</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Domain</dt>
              <dd className="mt-1 text-sm text-gray-900">{website.domain}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    website.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {website.active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">API Key</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900 break-all">
                {website.apiKey}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(website.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <dt className="text-sm font-medium text-gray-500">Elements</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{elementCount}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <dt className="text-sm font-medium text-gray-500">Variants</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{variantCount}</dd>
            </div>
          </dl>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Integration</h2>
          <div className="mt-4">
            <Link
              href={`/dashboard/websites/${website.id}/code`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              aria-label="Get integration code"
            >
              Get Integration Snippet
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Add our JavaScript snippet to your website to enable content variants.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold">Elements</h2>
        {elementCount === 0 ? (
          <div className="mt-4 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No elements found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You haven&apos;t added any elements yet. Elements are specific parts of your website
                    that you want to personalize with different content variants.
                  </p>
                  <Link
                    href={`/dashboard/websites/${website.id}/elements/new`}
                    className="mt-2 inline-block font-medium text-yellow-800 underline"
                    aria-label="Add a new element"
                  >
                    Add your first element
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Selector
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Variants
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {website.elements.map((element) => (
                  <tr key={element.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">
                      {element.selector}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {element.description || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {element.variants.length}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          href={`/dashboard/elements/${element.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label={`View element details`}
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/elements/${element.id}/edit`}
                          className="text-amber-600 hover:text-amber-900"
                          aria-label={`Edit element`}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/elements/${element.id}/variants/new`}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label={`Add variant`}
                        >
                          Add Variant
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
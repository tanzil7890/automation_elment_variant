import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Websites - Element Variants',
  description: 'Manage your connected websites',
};

// Fetch websites for the current user
async function getWebsites() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return [];
    }
    
    return await prisma.website.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return [];
  }
}

export default async function WebsitesPage() {
  const websites = await getWebsites();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Websites</h1>
        <Link
          href="/dashboard/websites/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add new website"
        >
          Add Website
        </Link>
      </div>
      
      {websites.length === 0 ? (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No websites found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You haven&apos;t added any websites yet. Add your first website to start creating content variants.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Elements
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {websites.map((website) => (
                <tr key={website.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {website.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {website.domain}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        website.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {website.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <Link
                      href={`/dashboard/websites/${website.id}/elements`}
                      className="text-indigo-600 hover:text-indigo-900"
                      aria-label={`Manage elements for ${website.name}`}
                    >
                      Manage Elements
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link
                        href={`/dashboard/websites/${website.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label={`View details for ${website.name}`}
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/websites/${website.id}/edit`}
                        className="text-amber-600 hover:text-amber-900"
                        aria-label={`Edit ${website.name}`}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/websites/${website.id}/code`}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`Get integration code for ${website.name}`}
                      >
                        Code
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="rounded-md bg-indigo-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">How it works</h3>
            <div className="mt-2 text-sm text-indigo-700">
              <p>
                Add your website details here, then create elements and their variants. Once set up, you&apos;ll
                receive a JavaScript snippet to add to your website which will load the right content variants
                based on your configured conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
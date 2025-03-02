import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/button';

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{website.name}</h1>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/websites/${website.id}/edit`}
          >
            <Button variant="outline">Edit Website</Button>
          </Link>
          <Link
            href={`/dashboard/websites/${website.id}/elements`}
          >
            <Button>Manage Elements</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-medium">Website Details</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Domain</dt>
              <dd className="mt-1 text-sm">{website.domain}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
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
              <dt className="text-sm font-medium text-muted-foreground">API Key</dt>
              <dd className="mt-1 text-sm font-mono break-all">
                {website.apiKey}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">
                {new Date(website.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-medium">Statistics</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <dt className="text-sm font-medium text-muted-foreground">Elements</dt>
              <dd className="mt-1 text-3xl font-semibold text-primary">{elementCount}</dd>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <dt className="text-sm font-medium text-muted-foreground">Variants</dt>
              <dd className="mt-1 text-3xl font-semibold text-primary">{variantCount}</dd>
            </div>
          </dl>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-medium">Integration</h2>
          <div className="mt-4">
            <Link
              href={`/dashboard/websites/${website.id}/code`}
              className="inline-flex items-center rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Get Integration Snippet
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Add our JavaScript snippet to your website to enable content variants.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Elements</h2>
          <Link href={`/dashboard/websites/${website.id}/elements`}>
            <Button variant="outline" size="sm">View All Elements</Button>
          </Link>
        </div>
        
        {elementCount === 0 ? (
          <div className="border border-yellow-200 rounded-md bg-yellow-50 p-4">
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
                  >
                    Add your first element
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full divide-y">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Selector
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Variants
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-background">
                {website.elements.map((element) => (
                  <tr key={element.id} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono">
                      {element.selector}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {element.description || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {element.variants.length}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          href={`/dashboard/websites/${website.id}/elements/${element.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/websites/${website.id}/elements/${element.id}/edit`}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/websites/${website.id}/elements/${element.id}/variants/new`}
                          className="text-blue-600 hover:text-blue-800"
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
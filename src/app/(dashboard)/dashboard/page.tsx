import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Element Variants',
  description: 'Overview of your Element Variants',
};

// Dashboard statistics card component
function StatCard({ title, value, href, description }: { 
  title: string; 
  value: number; 
  href: string;
  description: string;
}) {
  return (
    <Link 
      href={href}
      className="flex flex-col rounded-lg bg-white p-6 shadow-md transition-transform hover:translate-y-[-5px]"
      aria-label={`View ${title.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      </div>
      <p className="mt-2 text-3xl font-bold text-indigo-600">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </Link>
  );
}

// Fetch dashboard data
async function getDashboardData() {
  try {
    // Get counts from database
    const websiteCount = await prisma.website.count();
    const elementCount = await prisma.element.count();
    const variantCount = await prisma.variant.count();
    
    return {
      websiteCount,
      elementCount,
      variantCount,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      websiteCount: 0,
      elementCount: 0,
      variantCount: 0,
    };
  }
}

export default async function DashboardPage() {
  const { websiteCount, elementCount, variantCount } = await getDashboardData();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Websites" 
          value={websiteCount} 
          href="/dashboard/websites"
          description="Connected websites for content variation" 
        />
        <StatCard 
          title="Elements" 
          value={elementCount} 
          href="/dashboard/elements"
          description="Page elements with personalized variants" 
        />
        <StatCard 
          title="Variants" 
          value={variantCount} 
          href="/dashboard/variants"
          description="Content variants with conditional rules" 
        />
      </div>
      
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">1. Connect your website</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Register your website to start creating content variants.</p>
                  <Link 
                    href="/dashboard/websites/new" 
                    className="mt-2 inline-block font-medium text-blue-800 underline"
                    aria-label="Add a new website"
                  >
                    Add website
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">2. Select page elements</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Use CSS selectors to identify elements on your website that you want to personalize.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">3. Create content variants</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Create different versions of content and set conditions for when they should display.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">4. Add the snippet to your site</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Integrate our lightweight JavaScript snippet into your website to enable personalization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
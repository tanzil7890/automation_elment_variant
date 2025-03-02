'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Navigation items
const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Websites', href: '/dashboard/websites' },
  { name: 'Elements', href: '/dashboard/elements' },
  { name: 'Variants', href: '/dashboard/variants' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Don't render anything while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render the dashboard if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Element Variants</h1>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="mt-auto p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || 'Dashboard'}
            </h2>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
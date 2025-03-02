import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { ReactNode } from "react";

interface BreadcrumbLink {
  title: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbLinks?: BreadcrumbLink[];
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbLinks = [],
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbLinks.length > 0 && (
        <nav className="flex mb-4 text-sm">
          <ol className="flex items-center space-x-1 text-gray-500">
            <li>
              <Link href="/dashboard" className="hover:text-gray-700 flex items-center">
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </Link>
            </li>
            {breadcrumbLinks.map((link, index) => (
              <li key={index} className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 mx-1" />
                {index === breadcrumbLinks.length - 1 ? (
                  <span className="text-gray-900 font-medium">{link.title}</span>
                ) : (
                  <Link
                    href={link.href}
                    className="hover:text-gray-700"
                  >
                    {link.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-2">{description}</p>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
} 
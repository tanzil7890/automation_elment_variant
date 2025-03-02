import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Element Variants',
  description: 'Sign in or register for Element Variants',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
} 
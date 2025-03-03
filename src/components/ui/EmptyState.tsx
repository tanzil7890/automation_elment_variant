"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpenIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLink?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLink,
  actionLabel,
  icon = <FolderOpenIcon className="h-12 w-12 mb-4 text-black" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon}
      <h3 className="text-xl font-semibold mt-2">{title}</h3>
      <p className="text-muted-foreground mt-1 mb-4">{description}</p>
      {actionLink && actionLabel && (
        <Link href={actionLink}>
          <Button variant="default">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
} 
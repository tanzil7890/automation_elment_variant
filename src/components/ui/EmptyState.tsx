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
    <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg bg-gray-50 text-center">
      {icon}
      <h3 className="text-lg font-medium mb-2 text-black">{title}</h3>
      <p className="text-sm text-black mb-6">{description}</p>
      {actionLink && actionLabel && (
        <Link href={actionLink}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
} 
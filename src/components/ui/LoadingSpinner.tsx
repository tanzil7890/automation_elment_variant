"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 24, 
  className = "text-black" 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin ${className}`} size={size} />
    </div>
  );
} 
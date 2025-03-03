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
    <div className="flex justify-center items-center p-6">
      <Loader2 
        className={`animate-spin text-black ${className}`} 
        size={size} 
      />
    </div>
  );
} 
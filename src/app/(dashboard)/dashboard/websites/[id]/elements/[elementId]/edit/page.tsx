"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ElementData {
  id: string;
  selector: string;
  description: string;
}

export default function EditElementPage({ 
  params 
}: { 
  params: { id: string; elementId: string } 
}) {
  const router = useRouter();
  const websiteId = params.id;
  const elementId = params.elementId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ElementData>({
    id: "",
    selector: "",
    description: ""
  });

  useEffect(() => {
    const fetchElement = async () => {
      try {
        const response = await fetch(`/api/elements/${elementId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch element data");
        }

        const data = await response.json();
        setFormData({
          id: data.id,
          selector: data.selector,
          description: data.description || ""
        });
      } catch (err) {
        setError("Could not load element data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElement();
  }, [elementId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.selector.trim()) {
        throw new Error("CSS Selector is required");
      }

      // Make API call to update element
      const response = await fetch(`/api/elements/${elementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selector: formData.selector,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update element");
      }

      // Navigate back to element details page
      router.push(`/dashboard/websites/${params.id}/elements/${elementId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this element? This will also delete all variants and conditions.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete element");
      }

      // Navigate back to elements list
      router.push(`/dashboard/websites/${params.id}/elements`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="text-center p-12">
          <p>Loading element data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Edit Element</h1>
        <p className="text-muted-foreground">
          Update the CSS selector and description for this element
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">
        <div className="space-y-2">
          <label htmlFor="selector" className="text-sm font-medium">
            CSS Selector <span className="text-destructive">*</span>
          </label>
          <input
            id="selector"
            name="selector"
            type="text"
            value={formData.selector}
            onChange={handleChange}
            className="w-full p-2 border rounded-md font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid CSS selector that targets the element you want to personalize
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-sm min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Add a description to help you remember what this element is for
          </p>
        </div>

        <div className="pt-4 flex justify-between">
          <Button 
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Element"}
          </Button>
          
          <div className="flex space-x-4">
            <Link href={`/dashboard/websites/${params.id}/elements/${elementId}`}>
              <Button type="button" className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 
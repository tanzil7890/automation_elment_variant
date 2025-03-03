"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewElementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const websiteId = params.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    selector: "",
    description: ""
  });

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

      // Make API call to create element
      const response = await fetch("/api/elements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteId,
          selector: formData.selector,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create element");
      }

      // Navigate to elements page on success
      router.push(`/dashboard/websites/${params.id}/elements`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Add New Element</h1>
        <p className="text-muted-foreground">
          Define a CSS selector to target elements on your website
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
            placeholder="#header, .product-title, .hero-section"
            className="w-full p-2 border rounded-md font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid CSS selector that targets the element you want to personalize (e.g., #header, .product-title)
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
            placeholder="Hero section that appears on the homepage"
            className="w-full p-2 border rounded-md text-sm min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Add a description to help you remember what this element is for
          </p>
        </div>

        <div className="pt-4 flex justify-end space-x-4">
          <Link href={`/dashboard/websites/${params.id}/elements`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Element"}
          </Button>
        </div>
      </form>
    </div>
  );
} 
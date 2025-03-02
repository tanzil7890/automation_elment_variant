import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Variant {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  conditions: {
    id: string;
    conditionType: string;
    operator: string;
    value: string;
  }[];
}

interface ElementData {
  id: string;
  selector: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
  website: {
    id: string;
    name: string;
    domain: string;
  };
}

async function getElement(elementId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/elements/${elementId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch element: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching element:", error);
    return null;
  }
}

export default async function ElementDetailPage({
  params,
}: {
  params: { id: string; elementId: string };
}) {
  const websiteId = params.id;
  const elementId = params.elementId;
  const element = await getElement(elementId);

  if (!element) {
    notFound();
  }

  const typedElement = element as ElementData;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/dashboard/websites/${websiteId}`} className="hover:underline">
              {typedElement.website.name}
            </Link>{" "}
            /{" "}
            <Link href={`/dashboard/websites/${websiteId}/elements`} className="hover:underline">
              Elements
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Element Details</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/websites/${websiteId}/elements/${elementId}/edit`}>
            <Button variant="outline">Edit Element</Button>
          </Link>
          <Link href={`/dashboard/websites/${websiteId}/elements/${elementId}/variants/new`}>
            <Button>Add Variant</Button>
          </Link>
        </div>
      </div>

      {/* Element info card */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-6 py-4 border-b">
          <h2 className="font-medium">Element Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">CSS Selector</h3>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              {typedElement.selector}
            </p>
          </div>
          {typedElement.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p>{typedElement.description}</p>
            </div>
          )}
          <div className="pt-2 flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {new Date(typedElement.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>{" "}
              {new Date(typedElement.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Variants section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Content Variants</h2>
        
        {typedElement.variants.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Variants Created Yet</h3>
            <p className="text-muted-foreground mb-6">
              Variants allow you to display different content for this element based on conditions.
            </p>
            <Link href={`/dashboard/websites/${websiteId}/elements/${elementId}/variants/new`}>
              <Button>Add Your First Variant</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {typedElement.variants.map((variant) => (
              <div 
                key={variant.id} 
                className={`border rounded-lg overflow-hidden ${
                  variant.isDefault ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <div className="bg-muted px-6 py-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{variant.name}</h3>
                    {variant.isDefault && (
                      <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/websites/${websiteId}/elements/${elementId}/variants/${variant.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Content</h4>
                    <div className="bg-muted/50 p-3 rounded-md border overflow-auto max-h-[200px]">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {variant.content || "<No content>"}
                      </pre>
                    </div>
                  </div>
                  
                  {variant.conditions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h4>
                      <div className="grid gap-2">
                        {variant.conditions.map((condition) => (
                          <div 
                            key={condition.id}
                            className="bg-muted/30 p-2 rounded-md flex items-center text-sm"
                          >
                            <span className="font-medium mr-2">{condition.conditionType}:</span>
                            <span>{condition.operator}</span>
                            <span className="mx-2 font-mono bg-background px-2 py-0.5 rounded text-xs">
                              {condition.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
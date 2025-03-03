import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Element {
  id: string;
  selector: string;
  description: string;
  variants: {
    id: string;
    name: string;
    isDefault: boolean;
  }[];
}

async function getWebsite(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/websites/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching website:", error);
    return null;
  }
}

async function getElements(websiteId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/elements?websiteId=${websiteId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch elements: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching elements:", error);
    return [];
  }
}

export default async function ElementsPage({ params }: { params: { id: string } }) {
  const websiteId = params.id;
  const website = await getWebsite(websiteId);
  const elements = await getElements(websiteId);

  if (!website) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Elements for {website.name}</h1>
          <p className="text-muted-foreground">
            Manage the elements you want to personalize on {website.domain}
          </p>
        </div>
        <Link href={`/dashboard/websites/${params.id}/elements/new`}>
          <Button>Add New Element</Button>
        </Link>
      </div>

      {elements.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">No Elements Created Yet</h2>
          <p className="text-muted-foreground mb-6">
            Elements are the parts of your website you want to personalize with different content variants.
          </p>
          <Link href={`/dashboard/websites/${params.id}/elements/new`}>
            <Button>Add Your First Element</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Selector</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Variants</th>
                <th className="text-left py-3 px-4 font-medium w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {elements.map((element: Element) => (
                <tr key={element.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-xs">
                    {element.selector}
                  </td>
                  <td className="py-3 px-4">
                    {element.description || <span className="text-muted-foreground italic">No description</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {element.variants.map((variant) => (
                        <span
                          key={variant.id}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                            variant.isDefault
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {variant.name}
                          {variant.isDefault && (
                            <span className="ml-1">(Default)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/websites/${params.id}/elements/${element.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
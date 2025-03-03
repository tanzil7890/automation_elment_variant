import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import VariantForm from "@/components/variants/VariantForm";

export const metadata = {
  title: "Add New Variant | Dashboard",
};

export default async function NewVariantPage({
  params,
}: {
  params: { id: string; elementId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch the element to verify ownership and get element details
  const element = await prisma.element.findFirst({
    where: {
      id: params.elementId,
      website: {
        id: params.id,
        userId: session.user.id,
      },
    },
    include: {
      website: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!element) {
    // If element doesn't exist or user doesn't own it, redirect to websites page
    redirect("/dashboard/websites");
  }

  // Breadcrumb links
  const breadcrumbLinks = [
    { title: "Websites", href: "/dashboard/websites" },
    { title: element.website.name, href: `/dashboard/websites/${params.id}` },
    { title: "Elements", href: `/dashboard/websites/${params.id}/elements` },
    { title: element.name, href: `/dashboard/websites/${params.id}/elements/${params.elementId}` },
    { title: "Variants", href: `/dashboard/websites/${params.id}/elements/${params.elementId}/variants` },
    { title: "New Variant", href: `/dashboard/websites/${params.id}/elements/${params.elementId}/variants/new` },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Add New Variant for ${element.name}`}
        description="Create a new variant for this element"
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="mt-8">
        <VariantForm 
          elementId={params.elementId} 
          id={params.id}
          isDefault={element.variants.length === 0} // Make default if first variant
        />
      </div>
    </div>
  );
} 
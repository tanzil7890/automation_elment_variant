import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import VariantForm from "@/components/variants/VariantForm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Variant | Dashboard",
};

export default async function EditVariantPage({
  params,
}: {
  params: { websiteId: string; elementId: string; variantId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch the variant and element to verify ownership
  const variant = await prisma.variant.findFirst({
    where: {
      id: params.variantId,
      elementId: params.elementId,
      element: {
        websiteId: params.websiteId,
        website: {
          userId: session.user.id,
        },
      },
    },
    include: {
      element: {
        include: {
          website: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!variant) {
    notFound();
  }

  // Breadcrumb links
  const breadcrumbLinks = [
    { title: "Websites", href: "/dashboard/websites" },
    { title: variant.element.website.name, href: `/dashboard/websites/${params.websiteId}` },
    { title: "Elements", href: `/dashboard/websites/${params.websiteId}/elements` },
    { title: variant.element.name, href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}` },
    { title: "Variants", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants` },
    { title: "Edit Variant", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/edit` },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Edit Variant: ${variant.name}`}
        description="Modify the content and settings for this variant"
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="mt-8">
        <VariantForm 
          variant={{
            id: variant.id,
            name: variant.name,
            content: variant.content,
            isDefault: variant.isDefault,
          }}
          elementId={params.elementId} 
          websiteId={params.websiteId}
        />
      </div>
    </div>
  );
} 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ConditionForm from "@/components/conditions/ConditionForm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Add New Condition | Dashboard",
};

export default async function NewConditionPage({
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
        select: {
          name: true,
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
    { title: variant.name, href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}` },
    { title: "Conditions", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/conditions` },
    { title: "New Condition", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/conditions/new` },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Add New Condition for ${variant.name}`}
        description="Create conditions to control when this variant is displayed"
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="mt-8">
        <ConditionForm 
          variantId={params.variantId} 
          elementId={params.elementId}
          websiteId={params.websiteId}
        />
      </div>
    </div>
  );
} 
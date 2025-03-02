import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ConditionForm from "@/components/conditions/ConditionForm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Condition | Dashboard",
};

export default async function EditConditionPage({
  params,
}: {
  params: { websiteId: string; elementId: string; variantId: string; conditionId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch the condition, variant and element to verify ownership
  const condition = await prisma.condition.findFirst({
    where: {
      id: params.conditionId,
      variant: {
        id: params.variantId,
        elementId: params.elementId,
        element: {
          websiteId: params.websiteId,
          website: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      variant: {
        select: {
          name: true,
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
      },
    },
  });

  if (!condition) {
    notFound();
  }

  // Breadcrumb links
  const breadcrumbLinks = [
    { title: "Websites", href: "/dashboard/websites" },
    { title: condition.variant.element.website.name, href: `/dashboard/websites/${params.websiteId}` },
    { title: "Elements", href: `/dashboard/websites/${params.websiteId}/elements` },
    { title: condition.variant.element.name, href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}` },
    { title: "Variants", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants` },
    { title: condition.variant.name, href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}` },
    { title: "Conditions", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/conditions` },
    { title: "Edit Condition", href: `/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/conditions/${params.conditionId}/edit` },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Edit Condition for ${condition.variant.name}`}
        description="Modify this condition's settings"
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="mt-8">
        <ConditionForm 
          condition={{
            id: condition.id,
            conditionType: condition.conditionType,
            operator: condition.operator,
            value: condition.value,
            priority: condition.priority,
          }}
          variantId={params.variantId} 
          elementId={params.elementId}
          websiteId={params.websiteId}
        />
      </div>
    </div>
  );
} 
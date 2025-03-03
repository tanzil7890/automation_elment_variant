import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ConditionsList from "@/components/conditions/ConditionsList";
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const metadata = {
  title: "Variant Conditions | Dashboard",
};

export default async function VariantConditionsPage({
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
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Conditions for ${variant.name}`}
        description={`Define when this variant should be displayed instead of the default`}
        breadcrumbLinks={breadcrumbLinks}
      >
        <Link href={`/dashboard/websites/${params.websiteId}/elements/${params.elementId}/variants/${params.variantId}/conditions/new`}>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </Link>
      </PageHeader>

      {variant.isDefault && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4 text-sm text-yellow-800">
          <p className="font-medium">This is the default variant</p>
          <p className="mt-1">
            The default variant is shown when no targeting conditions from other variants match.
            Adding conditions to the default variant is optional and will only affect when this
            variant is shown if multiple variants have matching conditions.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Suspense fallback={<LoadingSpinner />}>
          <ConditionsList 
            variantId={params.variantId} 
            elementId={params.elementId}
            websiteId={params.websiteId}
          />
        </Suspense>
      </div>
    </div>
  );
} 
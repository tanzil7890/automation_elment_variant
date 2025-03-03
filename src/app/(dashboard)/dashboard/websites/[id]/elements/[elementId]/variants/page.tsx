import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import VariantsList from "@/components/variants/VariantsList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const metadata = {
  title: "Element Variants | Dashboard",
};

export default async function VariantsPage({
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
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Variants for ${element.name}`}
        description="Manage the different variations of this element"
        breadcrumbLinks={breadcrumbLinks}
      >
        <Link href={`/dashboard/websites/${params.id}/elements/${params.elementId}/variants/new`}>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </Link>
      </PageHeader>

      <div className="mt-8">
        <Suspense fallback={<LoadingSpinner />}>
          <VariantsList elementId={params.elementId} id={params.id} />
        </Suspense>
      </div>
    </div>
  );
} 
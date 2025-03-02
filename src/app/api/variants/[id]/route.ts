import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/variants/[id] - Get variant details with conditions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const variantId = params.id;

    // Find variant and check if it belongs to the user
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        element: {
          website: {
            userId: session.user.id,
          },
        },
      },
      include: {
        conditions: {
          orderBy: {
            priority: "asc",
          },
        },
        element: {
          select: {
            id: true,
            selector: true,
            websiteId: true,
            website: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error fetching variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 }
    );
  }
}

// PUT /api/variants/[id] - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const variantId = params.id;
    const body = await request.json();
    const { name, content, isDefault } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // Find variant and check if it belongs to the user
    const existingVariant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        element: {
          website: {
            userId: session.user.id,
          },
        },
      },
      include: {
        element: true,
      },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: "Variant not found or not owned by user" },
        { status: 404 }
      );
    }

    // Start a transaction to handle default variant logic
    const result = await prisma.$transaction(async (tx) => {
      // If this variant is set as default, unset any existing default variants
      if (isDefault && !existingVariant.isDefault) {
        await tx.variant.updateMany({
          where: {
            elementId: existingVariant.elementId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Update the variant
      const updatedVariant = await tx.variant.update({
        where: {
          id: variantId,
        },
        data: {
          name,
          content: content || "",
          isDefault: isDefault || false,
        },
      });

      return updatedVariant;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

// DELETE /api/variants/[id] - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const variantId = params.id;

    // Find variant and check if it belongs to the user
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        element: {
          website: {
            userId: session.user.id,
          },
        },
      },
      include: {
        element: {
          include: {
            variants: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found or not owned by user" },
        { status: 404 }
      );
    }

    // Prevent deletion if it's the only variant or if it's the default variant
    if (variant.element.variants.length === 1) {
      return NextResponse.json(
        { error: "Cannot delete the only variant. Elements must have at least one variant." },
        { status: 400 }
      );
    }

    if (variant.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default variant. Please set another variant as default first." },
        { status: 400 }
      );
    }

    // Delete the variant (and all associated conditions due to cascading delete)
    await prisma.variant.delete({
      where: {
        id: variantId,
      },
    });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
} 
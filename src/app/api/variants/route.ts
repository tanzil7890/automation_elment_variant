import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/variants - Get all variants for an element
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const elementId = searchParams.get("elementId");

    // Validate required parameters
    if (!elementId) {
      return NextResponse.json(
        { error: "elementId parameter is required" },
        { status: 400 }
      );
    }

    // Verify the element belongs to the authenticated user
    const element = await prisma.element.findFirst({
      where: {
        id: elementId,
        website: {
          userId: session.user.id,
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found or not owned by user" },
        { status: 404 }
      );
    }

    // Fetch variants with conditions
    const variants = await prisma.variant.findMany({
      where: {
        elementId: elementId,
      },
      include: {
        conditions: true,
      },
      orderBy: [
        { isDefault: "desc" }, // Default variant first
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

// POST /api/variants - Create a new variant
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { elementId, name, content, isDefault } = body;

    // Validate required fields
    if (!elementId || !name) {
      return NextResponse.json(
        { error: "elementId and name are required" },
        { status: 400 }
      );
    }

    // Verify the element belongs to the authenticated user
    const element = await prisma.element.findFirst({
      where: {
        id: elementId,
        website: {
          userId: session.user.id,
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found or not owned by user" },
        { status: 404 }
      );
    }

    // Start a transaction to handle default variant logic
    const result = await prisma.$transaction(async (tx) => {
      // If this variant is set as default, unset any existing default variants
      if (isDefault) {
        await tx.variant.updateMany({
          where: {
            elementId: elementId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Create the new variant
      const variant = await tx.variant.create({
        data: {
          elementId,
          name,
          content: content || "",
          isDefault: isDefault || false,
        },
      });

      return variant;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
} 
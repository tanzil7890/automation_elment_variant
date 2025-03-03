import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/elements - List elements for a website
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get websiteId from query parameter
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    if (!websiteId) {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    // Verify website belongs to the user
    const website = await prisma.website.findUnique({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or you don't have access" },
        { status: 404 }
      );
    }

    // Fetch elements for the website with variant counts
    const elements = await prisma.element.findMany({
      where: {
        websiteId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    // Map to include variant counts
    const elementsWithCounts = elements.map(element => ({
      ...element,
      variantsCount: element._count.variants,
      _count: undefined,
    }));

    return NextResponse.json(elementsWithCounts);
  } catch (error) {
    console.error("Error fetching elements:", error);
    return NextResponse.json(
      { error: "Failed to fetch elements" },
      { status: 500 }
    );
  }
}

// POST /api/elements - Create a new element
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, selector, websiteId } = body;

    // Validate required fields
    if (!name || !selector || !websiteId) {
      return NextResponse.json(
        { error: "Name, selector, and websiteId are required" },
        { status: 400 }
      );
    }

    // Verify website belongs to the user
    const website = await prisma.website.findUnique({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or you don't have access" },
        { status: 404 }
      );
    }

    // Create the element
    const element = await prisma.element.create({
      data: {
        name,
        selector,
        websiteId,
      },
    });

    // Create default variant for the element
    await prisma.variant.create({
      data: {
        name: "Default Variant",
        content: "", // Empty content initially
        isDefault: true,
        elementId: element.id,
      }
    });

    return NextResponse.json(element, { status: 201 });
  } catch (error) {
    console.error("Error creating element:", error);
    return NextResponse.json(
      { error: "Failed to create element" },
      { status: 500 }
    );
  }
} 
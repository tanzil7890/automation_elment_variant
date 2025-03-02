import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/elements - Get all elements for authenticated user
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
    const websiteId = searchParams.get("websiteId");

    // Validate required parameters
    if (!websiteId) {
      return NextResponse.json(
        { error: "websiteId parameter is required" },
        { status: 400 }
      );
    }

    // Verify the website belongs to the authenticated user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or not owned by user" },
        { status: 404 }
      );
    }

    // Fetch elements with basic variant info
    const elements = await prisma.element.findMany({
      where: {
        websiteId: websiteId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          }
        },
      },
    });

    return NextResponse.json(elements);
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
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { websiteId, selector, description } = body;

    // Validate required fields
    if (!websiteId || !selector) {
      return NextResponse.json(
        { error: "websiteId and selector are required" },
        { status: 400 }
      );
    }

    // Verify the website belongs to the authenticated user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or not owned by user" },
        { status: 404 }
      );
    }

    // Create the element
    const element = await prisma.element.create({
      data: {
        websiteId,
        selector,
        description: description || "",
      },
    });

    // Create a default variant for the element
    await prisma.variant.create({
      data: {
        elementId: element.id,
        name: "Default",
        content: "<!-- Default content -->",
        isDefault: true,
      },
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
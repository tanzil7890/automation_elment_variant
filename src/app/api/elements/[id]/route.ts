import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/elements/[id] - Get element details with variants
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

    const elementId = params.id;

    // Find element and check if it belongs to the user
    const element = await prisma.element.findFirst({
      where: {
        id: elementId,
        website: {
          userId: session.user.id
        }
      },
      include: {
        variants: {
          include: {
            conditions: true
          }
        },
        website: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      }
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json(element);
  } catch (error) {
    console.error("Error fetching element:", error);
    return NextResponse.json(
      { error: "Failed to fetch element" },
      { status: 500 }
    );
  }
}

// PUT /api/elements/[id] - Update element
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

    const elementId = params.id;
    const body = await request.json();
    const { selector, description } = body;

    // Validate required fields
    if (!selector) {
      return NextResponse.json(
        { error: "selector is required" },
        { status: 400 }
      );
    }

    // Find element and check if it belongs to the user
    const existingElement = await prisma.element.findFirst({
      where: {
        id: elementId,
        website: {
          userId: session.user.id
        }
      }
    });

    if (!existingElement) {
      return NextResponse.json(
        { error: "Element not found or not owned by user" },
        { status: 404 }
      );
    }

    // Update the element
    const updatedElement = await prisma.element.update({
      where: {
        id: elementId
      },
      data: {
        selector,
        description: description || ""
      }
    });

    return NextResponse.json(updatedElement);
  } catch (error) {
    console.error("Error updating element:", error);
    return NextResponse.json(
      { error: "Failed to update element" },
      { status: 500 }
    );
  }
}

// DELETE /api/elements/[id] - Delete element and all associated variants
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

    const elementId = params.id;

    // Find element and check if it belongs to the user
    const element = await prisma.element.findFirst({
      where: {
        id: elementId,
        website: {
          userId: session.user.id
        }
      }
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found or not owned by user" },
        { status: 404 }
      );
    }

    // Delete the element (and all associated variants due to cascading delete)
    await prisma.element.delete({
      where: {
        id: elementId
      }
    });

    return NextResponse.json({ message: "Element deleted successfully" });
  } catch (error) {
    console.error("Error deleting element:", error);
    return NextResponse.json(
      { error: "Failed to delete element" },
      { status: 500 }
    );
  }
} 
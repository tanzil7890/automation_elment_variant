import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface Params {
  id: string;
}

// GET /api/elements/[id] - Get a specific element
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Find the element and verify ownership
    const element = await prisma.element.findUnique({
      where: {
        id,
      },
      include: {
        website: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found" },
        { status: 404 }
      );
    }

    // Check if user owns the website that contains this element
    if (element.website.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have access to this element" },
        { status: 403 }
      );
    }

    // Return the element without the website data
    const { website, ...elementData } = element;
    return NextResponse.json(elementData);
  } catch (error) {
    console.error("Error fetching element:", error);
    return NextResponse.json(
      { error: "Failed to fetch element" },
      { status: 500 }
    );
  }
}

// PUT /api/elements/[id] - Update a specific element
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, selector } = body;

    // Validate required fields
    if (!name || !selector) {
      return NextResponse.json(
        { error: "Name and selector are required" },
        { status: 400 }
      );
    }

    // Find the element and verify ownership
    const element = await prisma.element.findUnique({
      where: {
        id,
      },
      include: {
        website: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found" },
        { status: 404 }
      );
    }

    // Check if user owns the website that contains this element
    if (element.website.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have access to this element" },
        { status: 403 }
      );
    }

    // Update the element
    const updatedElement = await prisma.element.update({
      where: {
        id,
      },
      data: {
        name,
        selector,
      },
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

// DELETE /api/elements/[id] - Delete a specific element
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Find the element and verify ownership
    const element = await prisma.element.findUnique({
      where: {
        id,
      },
      include: {
        website: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: "Element not found" },
        { status: 404 }
      );
    }

    // Check if user owns the website that contains this element
    if (element.website.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have access to this element" },
        { status: 403 }
      );
    }

    // Delete the element (this will cascade delete variants and conditions)
    await prisma.element.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting element:", error);
    return NextResponse.json(
      { error: "Failed to delete element" },
      { status: 500 }
    );
  }
} 
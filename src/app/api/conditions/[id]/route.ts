import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/conditions/[id] - Get a specific condition
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Condition ID is required" },
        { status: 400 }
      );
    }

    // Find the condition with ownership verification
    const condition = await prisma.condition.findFirst({
      where: {
        id,
        variant: {
          element: {
            website: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!condition) {
      return NextResponse.json(
        { error: "Condition not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json(condition);
  } catch (error) {
    console.error("Error fetching condition:", error);
    return NextResponse.json(
      { error: "Failed to fetch condition" },
      { status: 500 }
    );
  }
}

// PUT /api/conditions/[id] - Update a specific condition
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Condition ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { conditionType, operator, value, priority } = body;

    // Validate required fields
    if (!conditionType || !operator || value === undefined) {
      return NextResponse.json(
        { error: "conditionType, operator, and value are required" },
        { status: 400 }
      );
    }

    // Validate condition types
    const validConditionTypes = [
      "url", "path", "referrer", "device", "browser", "os",
      "screenSize", "time", "day", "date", "cookies", "queryParam",
      "userRole", "loginStatus", "language", "geolocation", "custom"
    ];

    if (!validConditionTypes.includes(conditionType)) {
      return NextResponse.json(
        { error: `conditionType must be one of: ${validConditionTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate operators
    const validOperators = [
      "equals", "not_equals", "contains", "not_contains", 
      "starts_with", "ends_with", "regex", "greater_than", 
      "less_than", "exists", "not_exists"
    ];

    if (!validOperators.includes(operator)) {
      return NextResponse.json(
        { error: `operator must be one of: ${validOperators.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify the condition belongs to the authenticated user
    const existingCondition = await prisma.condition.findFirst({
      where: {
        id,
        variant: {
          element: {
            website: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!existingCondition) {
      return NextResponse.json(
        { error: "Condition not found or not owned by user" },
        { status: 404 }
      );
    }

    // Update the condition
    const updatedCondition = await prisma.condition.update({
      where: { id },
      data: {
        conditionType,
        operator,
        value: String(value),
        priority: priority || existingCondition.priority,
      },
    });

    return NextResponse.json(updatedCondition);
  } catch (error) {
    console.error("Error updating condition:", error);
    return NextResponse.json(
      { error: "Failed to update condition" },
      { status: 500 }
    );
  }
}

// DELETE /api/conditions/[id] - Delete a specific condition
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Condition ID is required" },
        { status: 400 }
      );
    }

    // Verify the condition belongs to the authenticated user
    const condition = await prisma.condition.findFirst({
      where: {
        id,
        variant: {
          element: {
            website: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!condition) {
      return NextResponse.json(
        { error: "Condition not found or not owned by user" },
        { status: 404 }
      );
    }

    // Delete the condition
    await prisma.condition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting condition:", error);
    return NextResponse.json(
      { error: "Failed to delete condition" },
      { status: 500 }
    );
  }
} 
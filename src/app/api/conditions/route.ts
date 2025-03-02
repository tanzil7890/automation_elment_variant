import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// POST /api/conditions - Create a new condition
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
    const { variantId, conditionType, operator, value, priority } = body;

    // Validate required fields
    if (!variantId || !conditionType || !operator || value === undefined) {
      return NextResponse.json(
        { error: "variantId, conditionType, operator, and value are required" },
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

    // Verify the variant belongs to the authenticated user
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        element: {
          website: {
            userId: session.user.id,
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

    // Create the condition
    const condition = await prisma.condition.create({
      data: {
        variantId,
        conditionType,
        operator,
        value: String(value),
        priority: priority || 0,
      },
    });

    return NextResponse.json(condition, { status: 201 });
  } catch (error) {
    console.error("Error creating condition:", error);
    return NextResponse.json(
      { error: "Failed to create condition" },
      { status: 500 }
    );
  }
}

// GET /api/conditions - Get all conditions for a variant
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
    const variantId = searchParams.get("variantId");

    // Validate required parameters
    if (!variantId) {
      return NextResponse.json(
        { error: "variantId parameter is required" },
        { status: 400 }
      );
    }

    // Verify the variant belongs to the authenticated user
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        element: {
          website: {
            userId: session.user.id,
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

    // Fetch conditions
    const conditions = await prisma.condition.findMany({
      where: {
        variantId: variantId,
      },
      orderBy: {
        priority: "asc",
      },
    });

    return NextResponse.json(conditions);
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch conditions" },
      { status: 500 }
    );
  }
} 
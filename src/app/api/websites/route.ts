import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Fetch all websites for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch websites for the authenticated user
    const websites = await prisma.website.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new website
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { name, domain } = await request.json();
    
    // Validate request data
    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }
    
    // Simple domain validation
    const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost)$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }
    
    // Check if domain already exists for this user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        userId: session.user.id,
        domain,
      },
    });
    
    if (existingWebsite) {
      return NextResponse.json(
        { error: 'Domain already registered' },
        { status: 409 }
      );
    }
    
    // Create the website
    const website = await prisma.website.create({
      data: {
        name,
        domain,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(
      { 
        message: 'Website created successfully',
        website 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
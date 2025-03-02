import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Fetch a single website by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params;
    
    // Fetch the website
    const website = await prisma.website.findUnique({
      where: {
        id,
      },
      include: {
        elements: {
          include: {
            variants: {
              include: {
                conditions: true,
              },
            },
          },
        },
      },
    });
    
    // Check if website exists
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Check if the user owns the website
    if (website.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(website);
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a website
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params;
    const { name, domain, active } = await request.json();
    
    // Validate request data
    if (!name && !domain && active === undefined) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }
    
    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingWebsite) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Check if the user owns the website
    if (existingWebsite.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Domain validation if provided
    if (domain) {
      const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost)$/;
      if (!domainRegex.test(domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }
      
      // Check if new domain already exists for another website
      if (domain !== existingWebsite.domain) {
        const domainExists = await prisma.website.findFirst({
          where: {
            userId: session.user.id,
            domain,
            NOT: {
              id,
            },
          },
        });
        
        if (domainExists) {
          return NextResponse.json(
            { error: 'Domain already registered' },
            { status: 409 }
          );
        }
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;
    if (active !== undefined) updateData.active = active;
    
    // Update the website
    const updatedWebsite = await prisma.website.update({
      where: {
        id,
      },
      data: updateData,
    });
    
    return NextResponse.json({
      message: 'Website updated successfully',
      website: updatedWebsite,
    });
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a website
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params;
    
    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingWebsite) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Check if the user owns the website
    if (existingWebsite.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Delete the website
    await prisma.website.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({
      message: 'Website deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
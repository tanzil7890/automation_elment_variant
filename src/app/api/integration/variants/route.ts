import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ContextData {
  url: string;
  path: string;
  referrer: string;
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  timestamp: string;
}

interface VariantResult {
  selector: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }
    
    // Find website by API key
    const website = await prisma.website.findUnique({
      where: {
        apiKey,
        active: true,
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
    
    if (!website) {
      return NextResponse.json(
        { error: 'Invalid API key or inactive website' },
        { status: 401 }
      );
    }
    
    // Get context data from request body
    const contextData: ContextData = await request.json();
    
    // Prepare the response
    const variants: VariantResult[] = [];
    
    // Process each element and find the matching variant
    for (const element of website.elements) {
      let matchingVariant = null;
      let highestPriority = -1;
      
      // Find default variant (if any)
      const defaultVariant = element.variants.find(v => v.isDefault);
      
      // Check each variant for matching conditions
      for (const variant of element.variants) {
        // Skip default variant for now
        if (variant.isDefault) continue;
        
        let isMatch = true;
        let variantPriority = 0;
        
        // If no conditions, always match with priority 0
        if (variant.conditions.length === 0) {
          if (variantPriority > highestPriority) {
            highestPriority = variantPriority;
            matchingVariant = variant;
          }
          continue;
        }
        
        // Check all conditions for this variant
        for (const condition of variant.conditions) {
          const conditionValue = getContextValue(contextData, condition.conditionType);
          const isConditionMatch = evaluateCondition(conditionValue, condition.operator, condition.value);
          
          if (!isConditionMatch) {
            isMatch = false;
            break;
          }
          
          // Add priority if condition matches
          variantPriority += condition.priority;
        }
        
        // If all conditions match and priority is higher than current highest
        if (isMatch && variantPriority > highestPriority) {
          highestPriority = variantPriority;
          matchingVariant = variant;
        }
      }
      
      // If no variant matched the conditions, use default if available
      if (!matchingVariant && defaultVariant) {
        matchingVariant = defaultVariant;
      }
      
      // Add to response if we have a matching variant
      if (matchingVariant) {
        variants.push({
          selector: element.selector,
          content: matchingVariant.content,
        });
      }
    }
    
    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Error serving variants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

// Get value from context based on condition type
function getContextValue(context: ContextData, conditionType: string): string {
  switch (conditionType) {
    case 'url':
      return context.url || '';
    case 'path':
      return context.path || '';
    case 'referrer':
      return context.referrer || '';
    case 'user_agent':
      return context.userAgent || '';
    case 'language':
      return context.language || '';
    case 'device_type':
      // Determine device type based on user agent and screen size
      const userAgent = context.userAgent.toLowerCase();
      const screenWidth = context.screenWidth || 0;
      
      if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        return screenWidth > 768 ? 'tablet' : 'mobile';
      }
      return 'desktop';
    default:
      return '';
  }
}

// Evaluate condition based on operator and value
function evaluateCondition(contextValue: string, operator: string, conditionValue: string): boolean {
  const value = contextValue.toLowerCase();
  const condition = conditionValue.toLowerCase();
  
  switch (operator) {
    case 'equals':
      return value === condition;
    case 'not_equals':
      return value !== condition;
    case 'contains':
      return value.includes(condition);
    case 'not_contains':
      return !value.includes(condition);
    case 'starts_with':
      return value.startsWith(condition);
    case 'ends_with':
      return value.endsWith(condition);
    case 'regex':
      try {
        const regex = new RegExp(conditionValue);
        return regex.test(contextValue);
      } catch (error) {
        console.error('Invalid regex:', conditionValue);
        return false;
      }
    default:
      return false;
  }
} 
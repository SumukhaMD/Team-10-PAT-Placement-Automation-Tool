import { NextRequest, NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: 200 }
  );
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    },
    { status: 201 }
  );
}

export function notFoundResponse() {
  return errorResponse('Resource not found', 404);
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401);
}

export function forbiddenResponse() {
  return errorResponse('Forbidden', 403);
}

export function validateRequest(
  req: NextRequest,
  requiredFields: string[] = []
): { isValid: boolean; data?: any; error?: string } {
  try {
    // Check authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return { isValid: false, error: 'Missing authorization header' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid request' };
  }
}

export async function parseRequestBody(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

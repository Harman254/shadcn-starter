import { NextRequest, NextResponse } from 'next/server';
import { trackClick, trackConversionEvent } from '@/lib/notifications/tracking';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing tracking token' },
      { status: 400 }
    );
  }

  // Get user agent and IP for analytics
  const userAgent = request.headers.get('user-agent') || undefined;
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;

  // Track the click
  const result = await trackClick(token, userAgent, ipAddress);

  if (!result.success) {
    // Still redirect even if tracking fails (better UX)
    const redirectUrl = searchParams.get('redirect') || '/chat';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Get the redirect URL from query params or default to chat
  const redirectUrl = searchParams.get('redirect') || searchParams.get('url') || '/chat';

  // Redirect to the target URL
  try {
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    // If redirect URL is invalid, redirect to chat
    return NextResponse.redirect(new URL('/chat', request.url));
  }
}


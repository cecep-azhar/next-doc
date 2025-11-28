import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, callbackUrl } = body;

    console.log('🔐 API Route - Login attempt:', email);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    console.log('✅ SignIn result:', result);

    if (result?.error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      callbackUrl: callbackUrl || '/dashboard',
    });
  } catch (error) {
    console.error('❌ API Route error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

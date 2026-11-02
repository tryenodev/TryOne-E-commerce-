import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { DEMO_LOGIN_ACCOUNTS } from '@/lib/demo-login-accounts';

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ||
  '5e1a42926e6672323d3b6438eedf8c2d6cd171bb367913c3eab57b20886eddd6';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function handleJwtLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();

    // 1. Try DB lookup first
    try {
      const user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (user && user.isActive) {
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
          const token = await new SignJWT({
            id: user.id,
            email: user.email,
            role: user.role,
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(secretKey);

          return NextResponse.json(
            {
              message: 'Login successful',
              token,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              },
            },
            { status: 200 }
          );
        }
      }
    } catch (dbErr) {
      console.warn('[JWT login] Database lookup failed, falling back to demo accounts:', dbErr);
    }

    // 2. Demo accounts fallback
    const demo = DEMO_LOGIN_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === trimmedEmail.toLowerCase() &&
        acc.password === password
    );

    if (demo) {
      const demoId = `demo-${demo.role.toLowerCase()}-${demo.email.replace(/[^a-zA-Z0-9]/g, '')}`;
      const token = await new SignJWT({
        id: demoId,
        email: demo.email,
        role: demo.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secretKey);

      return NextResponse.json(
        {
          message: 'Login successful',
          token,
          user: {
            id: demoId,
            email: demo.email,
            name: demo.label,
            role: demo.role,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('JWT login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { userHasPermission } from '@/lib/tenant-helpers';
import { canManageRole } from '@/lib/permissions';
import type { TenantRole } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ tenantId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: TenantRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const tenantId = params.tenantId;

    // Check if user has permission to invite
    const canInvite = await userHasPermission(
      tenantId,
      session.user.id,
      'team.invite'
    );

    if (!canInvite) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members' },
        { status: 403 }
      );
    }

    // Get current user's role
    const currentMember = await db.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: session.user.id,
        },
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Check if current user can assign this role
    const canAssign = canManageRole(currentMember.role as TenantRole, role);
    if (!canAssign) {
      return NextResponse.json(
        { error: `You cannot assign the ${role} role` },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. They must create an account first.' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await db.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Create member
    const member = await db.tenantMember.create({
      data: {
        tenantId,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(user.email, tenant.name, role);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        role: member.role,
        user: member.user,
      },
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

// GET members list
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ tenantId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = params.tenantId;

    // Check if user is a member
    const isMember = await db.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: session.user.id,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const members = await db.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

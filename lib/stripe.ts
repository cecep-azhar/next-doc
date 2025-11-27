/**
 * STRIPE BILLING INTEGRATION
 * 
 * Handles subscription management, checkout sessions, customer portal, and webhooks
 */

import Stripe from 'stripe';
import { db } from '@/lib/db';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// =============================================================================
// STRIPE PLANS CONFIGURATION
// =============================================================================

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: process.env.STRIPE_PRICE_ID_FREE || '',
    features: [
      '1 project',
      '100 documents',
      'Basic search',
      'Community support',
    ],
    limits: {
      projects: 1,
      documents: 100,
      members: 3,
    },
  },
  PRO: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    features: [
      'Unlimited projects',
      'Unlimited documents',
      'Advanced search',
      'Custom domain',
      'Priority support',
      'Analytics',
    ],
    limits: {
      projects: -1, // unlimited
      documents: -1,
      members: 10,
    },
  },
  TEAM: {
    name: 'Team',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_TEAM!,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced permissions',
      'SSO',
      'Dedicated support',
      'SLA',
    ],
    limits: {
      projects: -1,
      documents: -1,
      members: -1,
    },
  },
} as const;

// =============================================================================
// CHECKOUT & SUBSCRIPTIONS
// =============================================================================

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession({
  tenantId,
  plan,
  successUrl,
  cancelUrl,
}: {
  tenantId: string;
  plan: 'PRO' | 'TEAM';
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { owner: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get or create Stripe customer
    let customerId = tenant.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.owner.email!,
        name: tenant.name,
        metadata: {
          tenantId: tenant.id,
          userId: tenant.ownerId,
        },
      });

      customerId = customer.id;

      // Update tenant with customer ID
      await db.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId: tenant.id,
        plan,
      },
      subscription_data: {
        metadata: {
          tenantId: tenant.id,
          plan,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create Stripe customer portal session
 */
export async function createCustomerPortalSession({
  tenantId,
  returnUrl,
}: {
  tenantId: string;
  returnUrl: string;
}) {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant?.stripeCustomerId) {
      throw new Error('No Stripe customer found for tenant');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

/**
 * Handle checkout session completed
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan as 'PRO' | 'TEAM';

  if (!tenantId || !plan) {
    throw new Error('Missing metadata in checkout session');
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      plan,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      subscriptionStatus: 'ACTIVE',
    },
  });

  // Log subscription
  await db.auditLog.create({
    data: {
      tenantId,
      action: 'SUBSCRIPTION_CREATED',
      resource: 'subscription',
      resourceId: subscription.id,
      metadata: JSON.stringify({ plan, status: 'ACTIVE' }),
    },
  });
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    throw new Error('Missing tenant ID in subscription metadata');
  }

  const status = mapStripeStatus(subscription.status);

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: status,
      stripePriceId: subscription.items.data[0].price.id,
    },
  });
}

/**
 * Handle subscription deleted (canceled)
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    throw new Error('Missing tenant ID in subscription metadata');
  }

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      plan: 'FREE',
      subscriptionStatus: 'CANCELED',
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
  });

  // Log cancellation
  await db.auditLog.create({
    data: {
      tenantId,
      action: 'SUBSCRIPTION_CANCELED',
      resource: 'subscription',
      resourceId: subscription.id,
      metadata: JSON.stringify({ reason: 'user_canceled' }),
    },
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Map Stripe subscription status to our status enum
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' {
  const statusMap: Record<
    Stripe.Subscription.Status,
    'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'
  > = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    incomplete: 'UNPAID',
    incomplete_expired: 'CANCELED',
    paused: 'CANCELED',
  };

  return statusMap[stripeStatus] || 'CANCELED';
}

/**
 * Check if tenant can access feature
 */
export async function canAccessFeature(
  tenantId: string,
  feature: 'custom_domain' | 'analytics' | 'sso' | 'advanced_search'
): Promise<boolean> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });

  if (!tenant) return false;

  const featureAccess: Record<
    string,
    Array<'FREE' | 'PRO' | 'TEAM'>
  > = {
    custom_domain: ['PRO', 'TEAM'],
    analytics: ['PRO', 'TEAM'],
    sso: ['TEAM'],
    advanced_search: ['PRO', 'TEAM'],
  };

  return featureAccess[feature]?.includes(tenant.plan) || false;
}

/**
 * Check if tenant has reached limit
 */
export async function hasReachedLimit(
  tenantId: string,
  limitType: 'projects' | 'documents' | 'members'
): Promise<boolean> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });

  if (!tenant) return true;

  const limits = STRIPE_PLANS[tenant.plan].limits;
  const limit = limits[limitType];

  // -1 means unlimited
  if (limit === -1) return false;

  // Count current usage
  let current = 0;

  switch (limitType) {
    case 'projects':
      current = await db.project.count({ where: { tenantId } });
      break;
    case 'documents':
      current = await db.document.count({
        where: {
          version: {
            project: {
              tenantId,
            },
          },
        },
      });
      break;
    case 'members':
      current = await db.tenantMember.count({ where: { tenantId } });
      break;
  }

  return current >= limit;
}

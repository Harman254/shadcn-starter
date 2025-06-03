/**
 * TypeScript type definitions for Polar webhook payloads
 * Based on Polar API documentation
 */

// Base webhook event interface that all events extend
export interface PolarWebhookEvent<T extends string, D> {
    type: T;
    data: D;
  }
  
  // Checkout Events
  
  export type CheckoutStatus = 'open' | 'expired' | 'confirmed' | 'succeeded' | 'failed';
  
  export interface CheckoutData {
    created_at: string;
    modified_at: string | null;
    id: string;
    payment_processor: 'stripe';
    status: CheckoutStatus;
    client_secret: string;
    url: string;
    expires_at: string;
    success_url: string;
    embed_origin: string | null;
    amount: number;
    discount_amount: number;
    net_amount: number;
    tax_amount: number | null;
    total_amount: number;
    currency: string;
    product_id: string;
    [key: string]: any; // Allow for additional fields
  }
  
  export type CheckoutCreatedEvent = PolarWebhookEvent<'checkout.created', CheckoutData>;
  export type CheckoutUpdatedEvent = PolarWebhookEvent<'checkout.updated', CheckoutData>;
  
  // Customer Events
  
  export interface CustomerData {
    id: string;
    created_at: string;
    modified_at: string | null;
    external_id: string;
    email: string;
    email_verified: boolean;
    name: string | null;
    tax_id: [string, string] | null;
    organization_id: string;
    deleted_at: string | null;
    avatar_url: string | null;
    [key: string]: any; // Allow for additional fields
  }
  
  export interface CustomerStateData extends CustomerData {
    active_subscriptions: Array<any>; // Could be further typed if structure is known
    active_benefits: Array<any>; // Could be further typed if structure is known
    active_meters: Array<any>; // Could be further typed if structure is known
  }
  
  export type CustomerCreatedEvent = PolarWebhookEvent<'customer.created', CustomerData>;
  export type CustomerUpdatedEvent = PolarWebhookEvent<'customer.updated', CustomerData>;
  export type CustomerDeletedEvent = PolarWebhookEvent<'customer.deleted', CustomerData>;
  export type CustomerStateChangedEvent = PolarWebhookEvent<'customer.state_changed', CustomerStateData>;
  
  // Union type of all possible webhook events
  export type PolarWebhookPayload =
    | CheckoutCreatedEvent
    | CheckoutUpdatedEvent
    | CustomerCreatedEvent
    | CustomerUpdatedEvent
    | CustomerDeletedEvent
    | CustomerStateChangedEvent;
  
  // Type guard functions to narrow webhook event types
  export function isCheckoutCreatedEvent(event: PolarWebhookPayload): event is CheckoutCreatedEvent {
    return event.type === 'checkout.created';
  }
  
  export function isCheckoutUpdatedEvent(event: PolarWebhookPayload): event is CheckoutUpdatedEvent {
    return event.type === 'checkout.updated';
  }
  
  export function isCustomerCreatedEvent(event: PolarWebhookPayload): event is CustomerCreatedEvent {
    return event.type === 'customer.created';
  }
  
  export function isCustomerUpdatedEvent(event: PolarWebhookPayload): event is CustomerUpdatedEvent {
    return event.type === 'customer.updated';
  }
  
  export function isCustomerDeletedEvent(event: PolarWebhookPayload): event is CustomerDeletedEvent {
    return event.type === 'customer.deleted';
  }
  
  export function isCustomerStateChangedEvent(event: PolarWebhookPayload): event is CustomerStateChangedEvent {
    return event.type === 'customer.state_changed';
  }
  
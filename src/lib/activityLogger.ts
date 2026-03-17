import { supabase } from '@/integrations/supabase/client';

export type ActivityAction =
  | 'admin_login'
  | 'admin_logout'
  | 'chat_reply_sent'
  | 'conversation_resolved'
  | 'chat_message_deleted'
  | 'product_added'
  | 'product_updated'
  | 'product_deleted'
  | 'testimonial_approved'
  | 'testimonial_hidden'
  | 'testimonial_deleted'
  | 'profile_saved'
  | 'profile_deleted';

export type EntityType =
  | 'auth'
  | 'conversation'
  | 'message'
  | 'product'
  | 'testimonial'
  | 'profile';

interface LogActivityOptions {
  action: ActivityAction;
  entity_type?: EntityType;
  entity_id?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

/**
 * Inserts a row into the activity_logs table.
 * Errors are silently swallowed so a logging failure never breaks the main flow.
 */
export async function logActivity(opts: LogActivityOptions): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('activity_logs').insert({
      admin_user_id: session.user.id,
      admin_email: session.user.email ?? '',
      action: opts.action,
      entity_type: opts.entity_type ?? null,
      entity_id: opts.entity_id ?? null,
      details: opts.details,
      metadata: opts.metadata ?? null,
    } as any);
  } catch {
    // Logging must never crash the app
  }
}

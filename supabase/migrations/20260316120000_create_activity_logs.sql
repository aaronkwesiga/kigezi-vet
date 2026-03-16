-- Activity / Audit Logs Table
-- Tracks every significant admin action across the system.

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT NOT NULL DEFAULT '',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can insert logs
CREATE POLICY "Admins can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can view logs
CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No update or delete — logs are immutable

-- Index for fast time-ordered lookups
CREATE INDEX activity_logs_created_at_idx ON public.activity_logs (created_at DESC);
CREATE INDEX activity_logs_admin_user_id_idx ON public.activity_logs (admin_user_id);
CREATE INDEX activity_logs_action_idx ON public.activity_logs (action);

-- Enable realtime so the Activity Log tab updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

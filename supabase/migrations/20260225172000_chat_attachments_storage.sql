-- Create chat_attachments bucket for images and voice notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for chat_attachments
-- 1. Allow public upload (visitors)
CREATE POLICY "Allow public upload to chat_attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat_attachments');

-- 2. Allow public read access
CREATE POLICY "Allow public read from chat_attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat_attachments');

-- 3. Allow admins to delete or manage (optional but good)
-- (Handled by public policies above for now, keep it simple like existing chat_recordings)

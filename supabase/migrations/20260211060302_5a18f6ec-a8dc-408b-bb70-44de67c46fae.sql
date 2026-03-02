
-- Drop public SELECT policies
DROP POLICY "Anyone can view conversations" ON public.chat_conversations;
DROP POLICY "Anyone can view messages" ON public.chat_messages;

-- Add admin-only SELECT policies
CREATE POLICY "Admins can view conversations" ON public.chat_conversations
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view messages" ON public.chat_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

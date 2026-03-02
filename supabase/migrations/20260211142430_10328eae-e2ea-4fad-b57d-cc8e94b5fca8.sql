
-- 1. Validation trigger for chat_conversations
CREATE OR REPLACE FUNCTION public.validate_chat_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.visitor_name := trim(NEW.visitor_name);
  IF length(NEW.visitor_name) = 0 OR length(NEW.visitor_name) > 100 THEN
    RAISE EXCEPTION 'visitor_name must be 1-100 characters';
  END IF;
  IF NEW.visitor_phone IS NOT NULL AND length(NEW.visitor_phone) > 20 THEN
    RAISE EXCEPTION 'visitor_phone must be at most 20 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_chat_conversation
BEFORE INSERT OR UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.validate_chat_conversation();

-- 2. Validation trigger for chat_messages
CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.message := trim(NEW.message);
  IF length(NEW.message) = 0 OR length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'message must be 1-5000 characters';
  END IF;
  IF NEW.sender_type NOT IN ('visitor', 'admin') THEN
    RAISE EXCEPTION 'sender_type must be visitor or admin';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_chat_message
BEFORE INSERT OR UPDATE ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_chat_message();

-- 3. Validation trigger for profiles
CREATE OR REPLACE FUNCTION public.validate_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.full_name IS NOT NULL THEN
    NEW.full_name := trim(NEW.full_name);
    IF length(NEW.full_name) > 200 THEN
      NEW.full_name := substring(NEW.full_name, 1, 200);
    END IF;
    IF length(NEW.full_name) = 0 THEN
      NEW.full_name := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_profile
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile();

-- 4. Harden handle_new_user to sanitize input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := trim(COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF length(v_full_name) > 200 THEN
    v_full_name := substring(v_full_name, 1, 200);
  END IF;
  IF v_full_name = '' THEN
    v_full_name := NULL;
  END IF;
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name);
  RETURN NEW;
END;
$$;

-- 5. Rate limiting for chat conversations (per visitor_name, simple approach)
CREATE OR REPLACE FUNCTION public.check_conversation_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.chat_conversations
  WHERE visitor_name = NEW.visitor_name
    AND created_at > now() - interval '1 hour';
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 5 conversations per hour';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_conversation_rate_limit
BEFORE INSERT ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.check_conversation_rate_limit();

-- 6. Rate limiting for chat messages (per conversation)
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.chat_messages
  WHERE conversation_id = NEW.conversation_id
    AND created_at > now() - interval '1 hour';
  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 60 messages per hour per conversation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_message_rate_limit
BEFORE INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.check_message_rate_limit();

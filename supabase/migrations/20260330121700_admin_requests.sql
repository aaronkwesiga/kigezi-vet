-- Create admin_requests table for tracking pending staff/admin accounts
CREATE TABLE public.admin_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Policies for admin_requests
-- 1. Users can insert their own request
CREATE POLICY "Users can request admin access" 
ON public.admin_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own request status
CREATE POLICY "Users can view own request" 
ON public.admin_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Admins can view all requests
CREATE POLICY "Admins can view all admin_requests" 
ON public.admin_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admins can update/resolve requests
CREATE POLICY "Admins can update admin_requests" 
ON public.admin_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_admin_requests_timestamp 
BEFORE UPDATE ON public.admin_requests 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle auto-insertion into user_roles when approved
CREATE OR REPLACE FUNCTION public.handle_admin_request_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the request transitioned to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Insert the user into user_roles as an 'admin'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- If the request transitioned to 'rejected' (or from approved to rejected/pending)
  IF NEW.status != 'approved' AND OLD.status = 'approved' THEN
    -- Remove the user from user_roles
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to run the function when a request is updated
CREATE TRIGGER on_admin_request_updated
  AFTER UPDATE OF status ON public.admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_request_approval();

-- Allow anyone (including unauthenticated users and farmers) to read
-- profiles that belong to admin users, so the vet portfolio is visible
-- on the public-facing home page.

CREATE POLICY "Anyone can view admin profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(user_id, 'admin'));

-- Also allow any authenticated user to read any profile
-- (needed for the farmer's own avatar to load and for the vet portfolio query fallback)
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

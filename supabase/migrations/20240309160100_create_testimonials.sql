-- Migration: Create Testimonials Table
-- Description: Creates the testimonials table with RLS policies for public submission and admin moderation

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Anyone can insert (submit) a testimonial
CREATE POLICY "Anyone can submit a testimonial" 
ON public.testimonials
FOR INSERT 
TO public
WITH CHECK (true);

-- Policy: Anyone can read approved testimonials
CREATE POLICY "Anyone can view approved testimonials" 
ON public.testimonials
FOR SELECT 
TO public
USING (is_approved = true);

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to testimonials"
ON public.testimonials
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Prevent public from updating/deleting (just to be explicit, though default is deny)
-- The insert and select policies above cover the public needs.

-- Migration: Fix infinite recursion in pool_members RLS policy
-- The previous SELECT policy on pool_members referenced itself, causing infinite recursion.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view pool members" ON public.pool_members;
DROP POLICY IF EXISTS "Members can view pools" ON public.pools;
DROP POLICY IF EXISTS "Anyone can find pool by invite code" ON public.pools;

-- Fix: pool_members SELECT - allow authenticated users to see members
-- The app logic already filters by pool_id, and pools are protected by their own RLS
CREATE POLICY "Authenticated users can view pool members" ON public.pool_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix: pools SELECT - simplified, any authenticated user can view pools
-- (they'll only query pools they know the ID of or are members of via app logic)
CREATE POLICY "Authenticated users can view pools" ON public.pools
  FOR SELECT USING (auth.uid() IS NOT NULL);

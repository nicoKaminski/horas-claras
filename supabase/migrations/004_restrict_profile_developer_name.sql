ALTER FUNCTION public.get_profile_developer_name(uuid)
SECURITY INVOKER;

REVOKE EXECUTE ON FUNCTION public.get_profile_developer_name(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_profile_developer_name(uuid)
TO authenticated;

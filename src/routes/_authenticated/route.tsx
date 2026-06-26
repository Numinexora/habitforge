import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pt-10">
        <Outlet />
      </main>
    </div>
  );
}

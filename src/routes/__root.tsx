import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { NbButton, NbCard } from "@/components/nb";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <NbCard tone="yellow" shadow="xl" className="max-w-md p-10 text-center">
        <h1 className="text-7xl">404</h1>
        <p className="mt-4 text-lg font-bold uppercase">Page not found</p>
        <p className="mt-2 text-sm">This habit hasn't been forged yet.</p>
        <Link to="/" className="mt-6 inline-block">
          <NbButton tone="ink">Go home</NbButton>
        </Link>
      </NbCard>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <NbCard tone="coral" shadow="xl" className="max-w-md p-10 text-center">
        <h1 className="text-2xl">Something broke</h1>
        <p className="mt-2 text-sm font-medium">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <NbButton
            tone="ink"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </NbButton>
          <Link to="/">
            <NbButton tone="white">Go home</NbButton>
          </Link>
        </div>
      </NbCard>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HabitForge — Build habits that stick" },
      {
        name: "description",
        content:
          "Track daily habits, build streaks, and visualize your progress with a bold neobrutalist dashboard.",
      },
      { property: "og:title", content: "HabitForge" },
      { property: "og:description", content: "Build habits that stick. Track streaks, analyze progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

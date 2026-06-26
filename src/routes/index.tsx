import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Calendar, BarChart3, Target, Sparkles } from "lucide-react";
import { NbButton, NbCard, NbBadge } from "@/components/nb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HabitForge — Forge habits that stick" },
      {
        name: "description",
        content:
          "Bold habit tracker with streaks, heatmaps, and analytics. Build the daily routines you actually want.",
      },
      { property: "og:title", content: "HabitForge — Forge habits that stick" },
      {
        property: "og:description",
        content: "Track daily habits, build streaks, see your year at a glance.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center nb-border rounded-md bg-nb-yellow nb-shadow-sm">
            <Flame className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">HabitForge</span>
        </Link>
        <Link to="/auth">
          <NbButton tone="ink" size="sm">
            Sign in
          </NbButton>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-16">
        <div className="relative">
          {/* floating bits */}
          <div className="pointer-events-none absolute -top-4 right-6 hidden md:block">
            <NbCard tone="pink" shadow="md" className="rotate-6 px-4 py-2 font-bold uppercase">
              <Flame className="mr-2 inline h-4 w-4" /> 42-day streak
            </NbCard>
          </div>
          <div className="pointer-events-none absolute bottom-6 -left-2 hidden md:block">
            <NbCard tone="mint" shadow="md" className="-rotate-3 px-4 py-2 font-bold uppercase">
              <Target className="mr-2 inline h-4 w-4" /> 7 / 7 this week
            </NbCard>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <NbBadge tone="yellow" className="mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Habit tracker, reimagined
            </NbBadge>
            <h1 className="text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
              Forge habits
              <br />
              <span className="bg-nb-yellow nb-border nb-shadow inline-block rounded-xl px-3 py-1">
                that stick.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-medium text-foreground/80 md:text-lg">
              Bold, opinionated habit tracking. Build streaks, group by category,
              and watch your year fill in like a GitHub heatmap.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <NbButton tone="ink" size="lg">
                  Start forging — Free
                </NbButton>
              </Link>
              <a href="#features">
                <NbButton tone="white" size="lg">
                  See features
                </NbButton>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <NbCard tone="yellow" shadow="lg" className="p-6">
            <Flame className="mb-3 h-8 w-8" strokeWidth={2.5} />
            <h3 className="text-xl">Streaks that matter</h3>
            <p className="mt-2 text-sm font-medium">
              Automatic current + longest streak per habit. Don't break the chain.
            </p>
          </NbCard>
          <NbCard tone="pink" shadow="lg" className="p-6">
            <Calendar className="mb-3 h-8 w-8" strokeWidth={2.5} />
            <h3 className="text-xl">Year heatmap</h3>
            <p className="mt-2 text-sm font-medium">
              See every day at a glance. Spot patterns. Celebrate consistency.
            </p>
          </NbCard>
          <NbCard tone="mint" shadow="lg" className="p-6">
            <BarChart3 className="mb-3 h-8 w-8" strokeWidth={2.5} />
            <h3 className="text-xl">Analytics dashboard</h3>
            <p className="mt-2 text-sm font-medium">
              Completion rates, weekly trends, category breakdowns — all in one place.
            </p>
          </NbCard>
        </div>

        <NbCard tone="ink" shadow="xl" className="mt-12 flex flex-col items-center gap-4 p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-3xl text-white">Your habits, your rules.</h2>
            <p className="mt-2 max-w-md text-sm font-medium text-white/80">
              Create custom categories, set weekly targets, search and filter — built for the way you actually live.
            </p>
          </div>
          <Link to="/auth">
            <NbButton tone="yellow" size="lg">
              Get started free
            </NbButton>
          </Link>
        </NbCard>
      </section>

      <footer className="border-t-[3px] border-nb-ink bg-nb-cream py-6 text-center text-sm font-bold uppercase tracking-wide">
        Built with HabitForge · Bold borders. Hard shadows. Real habits.
      </footer>
    </div>
  );
}

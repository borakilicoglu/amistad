"use client";

import { useEffect, useState } from "react";
import {
  ArrowCounterClockwiseIcon,
  BriefcaseIcon,
  CaretDownIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PaletteIcon,
  ReadCvLogoIcon,
  SlidersHorizontalIcon,
  SunIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardData } from "../../lib/data";

export function AppShell({
  data,
  children,
  searchValue = "",
  onSearchChange,
  filterDrawer,
  onResetFilters,
  canResetFilters = false,
}: {
  data: DashboardData;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterDrawer?: React.ReactNode;
  onResetFilters?: () => void;
  canResetFilters?: boolean;
}) {
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-24 flex-col items-center justify-between bg-rail px-3 py-7 max-lg:static max-lg:w-auto max-lg:flex-row">
        <div className="grid gap-5 max-lg:flex max-lg:items-center">
          <nav className="grid gap-4 max-lg:flex">
            <RailItem
              active={pathname === "/"}
              href="/"
              icon={<BriefcaseIcon size={24} weight="duotone" />}
              label="Jobs"
            />
            <RailItem
              active={pathname === "/reports"}
              href="/reports"
              icon={<ReadCvLogoIcon size={24} weight="duotone" />}
              label="Reports"
            />
            <RailItem
              active={pathname === "/design-guide"}
              href="/design-guide"
              icon={<PaletteIcon size={24} weight="duotone" />}
              label="Guide"
            />
          </nav>
        </div>

        <div className="grid gap-2 max-lg:flex">
          <ThemeToggle />
        </div>
      </aside>

      <div
        className={`min-w-0 transition-[padding] duration-200 ${
          filtersOpen && filterDrawer ? "pl-104" : "pl-24"
        } max-lg:pl-0`}
      >
        <header className="sticky top-0 z-10 grid h-38 content-center gap-5 bg-page px-16 max-md:px-8">
          <div className="flex items-center gap-5 max-lg:flex-col max-lg:items-stretch">
            <div className="flex h-12 items-center gap-4">
              <h1 className="m-0 text-3xl font-semibold leading-none">
                AMISTAD
              </h1>
            </div>

            <div className="flex h-14 min-w-115 flex-1 items-stretch overflow-hidden rounded-full bg-search max-lg:min-w-0">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-5 py-2 text-rail-muted">
                <MagnifyingGlassIcon size={20} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-rail-ink outline-none placeholder:text-rail-muted"
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder="Search jobs"
                  type="search"
                  value={searchValue}
                />
              </div>
              <div className="flex items-center gap-8 border-l border-rail-border px-8 py-2">
                <div className="flex flex-col justify-center">
                  <span className="block text-xs text-rail-muted">Sort by</span>
                  <span className="text-sm font-medium text-sort-value">
                    Recent
                  </span>
                </div>
                <span className="grid place-items-center text-sort-value">
                  <CaretDownIcon size={14} weight="fill" />
                </span>
              </div>
            </div>
            <div className="grid place-items-center p-2 cursor-pointer text-rail-muted hover:text-rail-ink hover:bg-[#212122] rounded-full transition-colors">
              <UserIcon size={24} weight="fill" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-accent"
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <SlidersHorizontalIcon size={16} />
                Filters
              </button>
              <span className="text-sm text-muted">{formatContext(data)}</span>
            </div>
            <span className="text-sm text-muted">
              Saved LinkedIn results and market signals
            </span>
          </div>
        </header>

        {children}
      </div>

      {filterDrawer ? (
        <aside
          className={`fixed inset-y-0 left-24 z-30 w-[320px] rounded-r-2xl bg-detail-panel p-6 transition-transform max-lg:left-0 max-lg:top-22 max-lg:w-full ${
            filtersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-end gap-5 text-muted">
            {onResetFilters ? (
              <button
                className="inline-flex items-center gap-2 text-sm font-semibold disabled:opacity-45"
                disabled={!canResetFilters}
                type="button"
                onClick={onResetFilters}
              >
                <ArrowCounterClockwiseIcon className="-scale-x-100" size={24} />
                Reset all
              </button>
            ) : null}
            <button
              aria-label="Close filters"
              type="button"
              onClick={() => setFiltersOpen(false)}
            >
              <XIcon size={24} />
            </button>
          </div>
          {filterDrawer}
        </aside>
      ) : null}
    </div>
  );
}

function RailItem({
  active = false,
  href,
  icon,
  label,
}: {
  active?: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      className={`group grid w-18 justify-items-center gap-2 text-sm font-bold transition-colors ${
        active ? "text-rail-active-ink" : "text-rail-muted hover:text-rail-ink"
      }`}
      href={href}
      title={label}
    >
      <span
        className={`grid place-items-center rounded-full transition-colors ${
          active
            ? "h-8 w-14 bg-rail-active"
            : "h-8 w-14 group-hover:bg-rail-hover"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("amistad-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const nextTheme =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : systemTheme;

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("amistad-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="group grid w-18 justify-items-center gap-2 text-sm font-bold text-rail-muted transition-colors hover:text-rail-ink"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      type="button"
      onClick={toggleTheme}
    >
      <span className="grid h-8 w-14 place-items-center rounded-full transition-colors group-hover:bg-rail-hover">
        {theme === "dark" ? (
          <SunIcon size={24} weight="duotone" />
        ) : (
          <MoonIcon size={24} weight="duotone" />
        )}
      </span>
    </button>
  );
}

function formatContext(data: DashboardData) {
  if (!data.metadata) return "Search context unavailable";
  const { profile, datePosted } = data.metadata;
  return `${profile.role} | ${profile.location} | ${formatDatePosted(datePosted)}`;
}

function formatDatePosted(datePosted: DashboardData["metadata"]["datePosted"]) {
  if (datePosted === "past-24-hours") return "Past 24 hours";
  if (datePosted === "past-week") return "Past week";
  return "Past month";
}

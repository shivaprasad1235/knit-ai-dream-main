import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store";
import * as api from "@/lib/api-client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/generator", label: "AI Studio" },
  { to: "/orders", label: "Orders" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(api.getLocalUser());
  const { location } = useRouterState();

  useEffect(() => {
    const syncUser = () => setCurrentUser(api.getLocalUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("lb:auth", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("lb:auth", syncUser);
    };
  }, []);

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event("lb:auth"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold transition-transform group-hover:rotate-[-6deg]">
            L
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Loop &amp; Bloom
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/generator"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Design with AI
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {currentUser ? (
            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              title={`Signed in as ${currentUser.full_name}`}
              className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-muted md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              to="/auth/login"
              aria-label="Sign in"
              className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-muted md:inline-flex"
            >
              <User className="h-4 w-4" />
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-display font-semibold">
              L
            </span>
            <span className="font-display text-lg font-semibold">Loop &amp; Bloom</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Slow-stitched crochet, made by hand and dreamed up with you.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-base font-semibold">Studio</h4>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>Hand-finished in small batches</li>
            <li>Natural fibers, ethically sourced</li>
            <li>Ships worldwide</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-base font-semibold">Care</h4>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>Hand-wash cool, lay flat to dry</li>
            <li>Store folded, away from sunlight</li>
            <li>Loved for decades, mended for free</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-5 py-5 text-center text-xs text-muted-foreground lg:px-8">
        © {new Date().getFullYear()} Loop &amp; Bloom Studio · Made with linen, light &amp; AI.
      </div>
    </footer>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

// GSAP is dynamically imported to keep ~40kB off the critical bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _gsap: any = null;
async function loadGsap() {
  if (!_gsap) {
    const mod = await import("gsap");
    _gsap = mod.default ?? mod;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _gsap;
}

// Context exposes page-transition controls for the stair animation overlay
// coverPage — panels slide down immediately (link click), hides current page
//   returns a Promise that resolves once the cover animation fully completes
// revealPage — panels slide up when new route is ready
// triggerStairs — full cover+reveal cycle for browser back/forward navigation
type StairsContextType = {
  coverPage: () => Promise<void>;
  revealPage: () => Promise<void>;
  triggerStairs: () => Promise<void>;
};

const StairsContext = createContext<StairsContextType>({
  coverPage: async () => undefined,
  revealPage: async () => undefined,
  triggerStairs: async () => undefined,
});

export function useStairs() {
  return useContext(StairsContext);
}

// Stairs component wraps the page content and manages the GSAP timeline for the stair transition overlay
// On route change, it animates 5 panels from top-to-bottom (cover), then bottom-to-top (reveal)
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
export function Stairs({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();
  const stairParentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const transitioningRef = useRef(false);
  const initialRef = useRef(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingTlRef = useRef<any>(null);
  const transitionHandledRef = useRef(false);

  const isCoveredRef = useRef(false);
  const skipUrlChangeRef = useRef(false);

  // ── helpers ──────────────────────────────────────────────────────────────

  const finishTransition = useCallback(() => {
    isCoveredRef.current = false;
    transitionHandledRef.current = true;
    skipUrlChangeRef.current = true;
  }, []);

  // ── exposed methods ──────────────────────────────────────────────────────

  // Full cover + reveal — used for browser back/forward (no TransitionLink involvement)
  const triggerStairs = useCallback(async () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    transitionHandledRef.current = false;

    const g = await loadGsap();
    g.set(stairParentRef.current, { display: "block" });
    g.set(".stair", { height: "0%", y: "0%" });

    // Cover
    await new Promise<void>((resolve) => {
      g.to(".stair", {
        height: "100%",
        duration: 0.35,
        stagger: { amount: 0.04 },
        ease: "power3.inOut",
        onComplete: resolve,
      });
    });

    isCoveredRef.current = true;

    // Reveal
    await new Promise<void>((resolve) => {
      g.to(".stair", {
        y: "100%",
        duration: 0.35,
        stagger: { amount: 0.04 },
        ease: "power3.inOut",
        onComplete: resolve,
      });
    });

    g.set(stairParentRef.current, { display: "none" });
    g.set(".stair", { y: "0%" });
    finishTransition();
  }, [finishTransition]);

  // Cover only — panels slide down immediately on link click.
  // Returns a Promise that resolves when the cover animation finishes.
  const coverPage = useCallback(async () => {
    if (isCoveredRef.current) return;
    transitioningRef.current = true;
    transitionHandledRef.current = false;

    const g = await loadGsap();
    g.set(stairParentRef.current, { display: "block" });
    g.set(".stair", { height: "0%", y: "0%" });

    return new Promise<void>((resolve) => {
      g.to(".stair", {
        height: "100%",
        duration: 0.35,
        stagger: { amount: 0.04 },
        ease: "power3.inOut",
        onComplete: () => {
          isCoveredRef.current = true;
          resolve();
        },
      });
    });
  }, []);

  // Reveal only — panels slide up when new route content is ready
  const revealPage = useCallback(async () => {
    if (!isCoveredRef.current) return;

    const g = await loadGsap();
    await new Promise<void>((resolve) => {
      g.to(".stair", {
        y: "100%",
        duration: 0.35,
        stagger: { amount: 0.04 },
        ease: "power3.inOut",
        onComplete: resolve,
      });
    });

    g.set(stairParentRef.current, { display: "none" });
    g.set(".stair", { y: "0%" });
    finishTransition();
  }, [finishTransition]);

  // ── watcher for back / forward navigation ────────────────────────────────

  useLayoutEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    if (isCoveredRef.current) return; // Already covered by TransitionLink — reveal handles it
    if (transitioningRef.current) return;
    if (transitionHandledRef.current) {
      transitionHandledRef.current = false;
      return;
    }

    transitioningRef.current = true;

    let killed = false;

    void loadGsap().then(async (g) => {
      if (killed) return;

      g.killTweensOf(".stair");
      g.set(".stair", { height: "100%", y: "0%" });

      // Cover
      g.set(stairParentRef.current, { display: "block" });
      await new Promise<void>((resolve) => {
        g.from(".stair", {
          height: 0,
          duration: 0.35,
          stagger: { amount: 0.04 },
          ease: "power3.inOut",
          onComplete: resolve,
        });
      });

      isCoveredRef.current = true;

      // Reveal
      await new Promise<void>((resolve) => {
        g.to(".stair", {
          y: "100%",
          duration: 0.35,
          stagger: { amount: 0.04 },
          ease: "power3.inOut",
          onComplete: resolve,
        });
      });

      if (killed) return;
      g.set(stairParentRef.current, { display: "none" });
      g.set(".stair", { y: "0%" });
      transitioningRef.current = false;
      pendingTlRef.current = null;
      isCoveredRef.current = false;
    });

    return () => {
      killed = true;
    };
  }, [currentPath]);

  // ── render ───────────────────────────────────────────────────────────────

  const onUrlChange = useCallback(() => {
    if (skipUrlChangeRef.current) {
      skipUrlChangeRef.current = false;
      return;
    }
    if (isCoveredRef.current) {
      // Wait for the next paint frame so the cover animation's final state is
      // committed to screen before starting the reveal — prevents the cover
      // looking cut off when TransitionLink fires router.push() synchronously.
      requestAnimationFrame(() => {
        void revealPage();
      });
    } else {
      void triggerStairs();
    }
  }, [revealPage, triggerStairs]);

  return (
    <StairsContext.Provider value={{ coverPage, revealPage, triggerStairs }}>
      {/* StairsWatcher uses useSearchParams which requires a Suspense boundary */}
      <Suspense fallback={null}>
        <StairsWatcher onUrlChange={onUrlChange} />
      </Suspense>
      <div>
        <div
          ref={stairParentRef}
          className="pointer-events-none fixed top-0 z-[100] hidden h-screen w-full"
        >
          <div className="flex h-full w-full" style={{ gap: 0 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="stair h-full w-1/5 bg-neutral-950/40 backdrop-blur-sm"
                style={{ outline: "1px solid var(--color-neutral-800)", outlineOffset: "-1px" }}
              />
            ))}
          </div>
        </div>
        <div ref={pageRef}>{children}</div>
      </div>
    </StairsContext.Provider>
  );
}

// Watches for ANY URL change (pathname + search params) and triggers the stair animation
// Handles back/forward browser nav and programmatic router.push calls with search params
function StairsWatcher({ onUrlChange }: { onUrlChange: () => void }) {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const urlKey = currentPath + "?" + searchParams.toString();
  const prevUrlKeyRef = useRef(urlKey);
  const initialRef = useRef(true);

  useLayoutEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      prevUrlKeyRef.current = urlKey;
      return;
    }
    if (prevUrlKeyRef.current === urlKey) return;
    prevUrlKeyRef.current = urlKey;

    // Trigger the stair animation — cover over current page, then reveal new content
    onUrlChange();
  }, [urlKey, onUrlChange]);

  return null;
}

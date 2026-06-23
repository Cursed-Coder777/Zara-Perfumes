"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useLayoutEffect, useRef } from "react";

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
// revealPage — panels slide up when new route is ready (called by StairsWatcher)
// triggerStairs — full cover+reveal cycle for browser back/forward navigation
type StairsContextType = {
  coverPage: () => Promise<void>;
  triggerStairs: () => Promise<void>;
};

const StairsContext = createContext<StairsContextType>({
  coverPage: async () => undefined,
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

  // Full cover + reveal — used for browser back/forward (no TransitionLink involvement)
  const triggerStairs = useCallback(async () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    transitionHandledRef.current = false;

    const g = await loadGsap();
    g.set(stairParentRef.current, { display: "block" });
    g.set(".stair", { height: "0%", y: "0%" });
    g.set(pageRef.current, { opacity: 0, y: 10 });

    const tl = g.timeline();
    tl.to(".stair", {
      height: "100%",
      duration: 0.25,
      stagger: { amount: 0.12 },
      ease: "power3.inOut",
    });
    tl.call(() => {
      requestAnimationFrame(() => {
        void loadGsap().then((g2) => {
          g2.to(".stair", {
            y: "100%",
            duration: 0.25,
            stagger: { amount: 0.12 },
            ease: "power3.inOut",
            onComplete: () => {
              g2.set(stairParentRef.current, { display: "none" });
              g2.set(".stair", { y: "0%" });
              g2.to(pageRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.2,
                ease: "power2.out",
                onComplete: () => {
                  transitioningRef.current = false;
                  pendingTlRef.current = null;
                  transitionHandledRef.current = true;
                },
              });
            },
          });
        });
      });
    });

    pendingTlRef.current = tl;
  }, []);

  // Cover only — panels slide down immediately on link click
  const coverPage = useCallback(async () => {
    if (isCoveredRef.current) return;
    transitioningRef.current = true;
    transitionHandledRef.current = false;

    const g = await loadGsap();
    g.set(stairParentRef.current, { display: "block" });
    g.set(".stair", { height: "0%", y: "0%" });
    g.set(pageRef.current, { opacity: 0, y: 10 });

    g.to(".stair", {
      height: "100%",
      duration: 0.25,
      stagger: { amount: 0.12 },
      ease: "power3.inOut",
      onComplete: () => {
        isCoveredRef.current = true;
      },
    });
  }, []);

  // Reveal only — panels slide up when new page content is ready
  const revealPage = useCallback(async () => {
    if (!isCoveredRef.current) return;

    const g = await loadGsap();
    g.to(".stair", {
      y: "100%",
      duration: 0.25,
      stagger: { amount: 0.12 },
      ease: "power3.inOut",
      onComplete: () => {
        g.set(stairParentRef.current, { display: "none" });
        g.set(".stair", { y: "0%" });
        g.to(pageRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            transitioningRef.current = false;
            pendingTlRef.current = null;
            isCoveredRef.current = false;
            transitionHandledRef.current = true;
          },
        });
      },
    });
  }, []);

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

    void loadGsap().then((g) => {
      if (killed) return;

      g.killTweensOf(".stair");
      g.set(".stair", { height: "100%", y: "0%" });
      g.set(pageRef.current, { opacity: 0, y: 10 });

      const tl = g.timeline();
      tl.set(stairParentRef.current, { display: "block" });
      tl.from(".stair", {
        height: 0,
        duration: 0.25,
        stagger: { amount: 0.12 },
        ease: "power3.inOut",
      });
      tl.to(".stair", {
        y: "100%",
        duration: 0.25,
        stagger: { amount: 0.12 },
        ease: "power3.inOut",
      });
      tl.set(stairParentRef.current, { display: "none" });
      tl.set(".stair", { y: "0%" });
      tl.to(pageRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          transitioningRef.current = false;
          pendingTlRef.current = null;
        },
      });
    });

    return () => {
      killed = true;
    };
  }, [currentPath]);

  return (
    <StairsContext.Provider value={{ coverPage, triggerStairs }}>
      {/* StairsWatcher uses useSearchParams which requires a Suspense boundary */}
      <Suspense fallback={null}>
        <StairsWatcher
          onUrlChange={() => {
            if (isCoveredRef.current) {
              void revealPage();
            } else {
              void triggerStairs();
            }
          }}
        />
      </Suspense>
      <div>
        <div
          ref={stairParentRef}
          className="pointer-events-none fixed top-0 z-[100] hidden h-screen w-full"
        >
          <div className="flex h-full w-full" style={{ gap: 0 }}>
            <div
              className="stair h-full w-1/5 bg-white"
              style={{ outline: "1px solid #fff", outlineOffset: "-1px" }}
            />
            <div
              className="stair h-full w-1/5 bg-white"
              style={{ outline: "1px solid #fff", outlineOffset: "-1px" }}
            />
            <div
              className="stair h-full w-1/5 bg-white"
              style={{ outline: "1px solid #fff", outlineOffset: "-1px" }}
            />
            <div
              className="stair h-full w-1/5 bg-white"
              style={{ outline: "1px solid #fff", outlineOffset: "-1px" }}
            />
            <div
              className="stair h-full w-1/5 bg-white"
              style={{ outline: "1px solid #fff", outlineOffset: "-1px" }}
            />
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

"use client";

// GSAP-based page transition overlay: animates 5 vertical "stair" panels on route change
// Provides startTransition() via context for use with TransitionLink
// Also watches for any URL change (pathname + search params) via StairsWatcher so Stairs animation runs on ALL navigations
import gsap from "gsap";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useLayoutEffect, useRef } from "react";

// Context type: provides methods to trigger the stair-animation transition
// startTransition — navigates then animates (legacy, used by TransitionLink with nav)
// triggerStairs — animates only, for when navigation is handled separately
type StairsContextType = {
  startTransition: (navigate: () => void) => void;
  triggerStairs: () => void;
};

const StairsContext = createContext<StairsContextType>({
  startTransition: () => undefined,
  triggerStairs: () => undefined,
});

export function useStairs() {
  return useContext(StairsContext);
}

// Stairs component wraps the page content and manages the GSAP timeline for the stair transition overlay
// On route change, it animates 5 panels from top-to-bottom (cover), then bottom-to-top (reveal)
export function Stairs({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();
  const stairParentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const transitioningRef = useRef(false);
  const initialRef = useRef(true);
  const pendingTlRef = useRef<gsap.core.Timeline | null>(null);
  const transitionHandledRef = useRef(false);

  // Plays the stair animation (cover then reveal) without navigation
  const triggerStairs = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    transitionHandledRef.current = false;

    gsap.set(stairParentRef.current, { display: "block" });
    gsap.set(".stair", { height: "0%", y: "0%" });
    gsap.set(pageRef.current, { opacity: 0, y: 10 });

    const tl = gsap.timeline();
    tl.to(".stair", {
      height: "100%",
      duration: 0.25,
      stagger: { amount: 0.12 },
      ease: "power3.inOut",
    });
    // After cover: wait one frame for the new page DOM, then reveal
    tl.call(() => {
      requestAnimationFrame(() => {
        gsap.to(".stair", {
          y: "100%",
          duration: 0.25,
          stagger: { amount: 0.12 },
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(stairParentRef.current, { display: "none" });
            gsap.set(".stair", { y: "0%" });
            gsap.to(pageRef.current, {
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

    pendingTlRef.current = tl;
  }, []);

  // Legacy: navigates first, then plays the stair animation
  const startTransition = useCallback((navigate: () => void) => {
    if (transitioningRef.current) return;
    navigate();
    triggerStairs();
  }, [triggerStairs]);

  useLayoutEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    // TransitionLink navigations are handled entirely by startTransition
    if (transitioningRef.current) return;
    if (transitionHandledRef.current) {
      transitionHandledRef.current = false;
      return;
    }

    transitioningRef.current = true;

    gsap.killTweensOf(".stair");
    gsap.set(".stair", { height: "100%", y: "0%" });
    gsap.set(pageRef.current, { opacity: 0, y: 10 });

    const tl = gsap.timeline();

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

    return () => {
      tl.kill();
    };
  }, [currentPath]);

  return (
    <StairsContext.Provider value={{ startTransition, triggerStairs }}>
      {/* StairsWatcher uses useSearchParams which requires a Suspense boundary */}
      <Suspense fallback={null}>
        <StairsWatcher onUrlChange={triggerStairs} />
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

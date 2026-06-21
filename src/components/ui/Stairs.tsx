"use client";

// GSAP-based page transition overlay: animates 5 vertical "stair" panels on route change
// Provides startTransition() via context for use with TransitionLink
import gsap from "gsap";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

// Context type: provides a method to trigger the stair-animation transition before navigating
type StairsContextType = {
  startTransition: (navigate: () => void) => void;
};

const StairsContext = createContext<StairsContextType>({
  startTransition: () => undefined,
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

  const startTransition = useCallback((navigate: () => void) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

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
    tl.call(() => navigate());

    pendingTlRef.current = tl;
  }, []);

  useLayoutEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    gsap.killTweensOf(".stair");
    gsap.set(".stair", { height: "100%", y: "0%" });
    gsap.set(pageRef.current, { opacity: 0, y: 10 });

    const tl = gsap.timeline({
      onComplete: () => {
        transitioningRef.current = false;
        pendingTlRef.current = null;
      },
    });

    if (!transitioningRef.current) {
      tl.set(stairParentRef.current, { display: "block" });
      tl.from(".stair", {
        height: 0,
        duration: 0.25,
        stagger: { amount: 0.12 },
        ease: "power3.inOut",
      });
    }

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
    });

    return () => {
      tl.kill();
    };
  }, [currentPath]);

  return (
    <StairsContext.Provider value={{ startTransition }}>
      <div>
        <div
          ref={stairParentRef}
          className="fixed top-0 z-[100] hidden h-screen w-full pointer-events-none"
        >
          <div className="flex h-full w-full" style={{ gap: 0 }}>
            <div className="stair h-full w-1/5 bg-white" style={{ outline: "1px solid #fff", outlineOffset: "-1px" }} />
            <div className="stair h-full w-1/5 bg-white" style={{ outline: "1px solid #fff", outlineOffset: "-1px" }} />
            <div className="stair h-full w-1/5 bg-white" style={{ outline: "1px solid #fff", outlineOffset: "-1px" }} />
            <div className="stair h-full w-1/5 bg-white" style={{ outline: "1px solid #fff", outlineOffset: "-1px" }} />
            <div className="stair h-full w-1/5 bg-white" style={{ outline: "1px solid #fff", outlineOffset: "-1px" }} />
          </div>
        </div>
        <div ref={pageRef}>{children}</div>
      </div>
    </StairsContext.Provider>
  );
}

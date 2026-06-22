"use client";

// Framer Motion for drag gesture, motion values, and spring animations
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useState, useEffect } from 'react';

/** Props for the CardRotate sub-component that handles the drag-to-send-back behaviour. */
interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
}

/** Individual card wrapper with drag support.
 *  When dragged past the sensitivity threshold the card is sent to the back of the stack;
 *  otherwise it snaps back to its original position. */
function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }: CardRotateProps) {
  // Track pixel offset from the card's resting position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Map linear drag distance to a rotation angle (parallax tilt effect)
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  /** On drag end, either send the card to the back (if threshold exceeded) or snap back. */
  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  // When drag is disabled (e.g. mobile click-only mode), render a static card
  if (disableDrag) {
    return (
      <motion.div className="absolute inset-0 cursor-pointer" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

/** Props for the public Stack component. */
interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  cards?: React.ReactNode[];
  animationConfig?: { stiffness: number; damping: number };
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
}

/** Stack card component with Framer Motion.
 *  Displays a deck of cards that can be dragged or clicked to send them to the back,
 *  revealing the next card underneath. Supports autoplay, mobile optimisations, and
 *  custom spring animation configuration. */
export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768
}: StackProps) {
  // Track whether the viewport is below the mobile breakpoint (used for click-only mode)
  const [isMobile, setIsMobile] = useState(false);
  // Pause autoplay when the user hovers over the stack (if pauseOnHover is enabled)
  const [isPaused, setIsPaused] = useState(false);

  // Listen for viewport resize to update the mobile flag
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // On mobile with mobileClickOnly enabled, disable drag in favour of tap-to-send
  const shouldDisableDrag = mobileClickOnly && isMobile;
  const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

  // Internal card stack state — initialised from the `cards` prop or with default Unsplash images
  const [stack, setStack] = useState<{ id: number; content: React.ReactNode }[]>(() => {
    if (cards.length) {
      return cards.map((content, index) => ({ id: index + 1, content }));
    } else {
      // Fallback demo images when no cards prop is provided
      return [
        {
          id: 1,
          content: (
            <img
              src="/images/card-1.jpg"
              alt="card-1"
              className="w-full h-full object-cover pointer-events-none"
            />
          )
        },
        {
          id: 2,
          content: (
            <img
              src="/images/card-2.jpg"
              alt="card-2"
              className="w-full h-full object-cover pointer-events-none"
            />
          )
        },
        {
          id: 3,
          content: (
            <img
              src="/images/card-3.jpg"
              alt="card-3"
              className="w-full h-full object-cover pointer-events-none"
            />
          )
        },
        {
          id: 4,
          content: (
            <img
              src="/images/card-4.jpg"
              alt="card-4"
              className="w-full h-full object-cover pointer-events-none"
            />
          )
        }
      ];
    }
  });

  // Sync internal state when the cards prop changes at runtime
  useEffect(() => {
    if (cards.length) {
      setStack(cards.map((content, index) => ({ id: index + 1, content })));
    }
  }, [cards]);

  /** Move the card with the given ID to the back of the stack. */
  const sendToBack = (id: number) => {
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      const [card] = newStack.splice(index, 1);
      if (card) newStack.unshift(card);
      return newStack;
    });
  };

  // Autoplay interval — sends the topmost card to the back on each tick
  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1]!.id;
        sendToBack(topCardId);
      }, autoplayDelay);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused]);

  return (
    <div
      className="relative w-full h-full"
      style={{
        perspective: 600
      }}
      // Hover handlers for pause-on-hover autoplay behaviour
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        // Optional randomised rotation offset for a more organic look
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
          >
            <motion.div
              className="rounded-2xl overflow-hidden w-full h-full"
              // Click handler sends card to back when sendToBackOnClick or mobileClickOnly is active
              onClick={() => shouldEnableClick && sendToBack(card.id)}
              animate={{
                // Each card in the stack is rotated slightly more, creating a fan effect
                rotateZ: (stack.length - index - 1) * 4 + randomRotate,
                // Cards further from the top are scaled down slightly
                scale: 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}

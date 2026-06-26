import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

/* ---------- NB Button ---------- */
const nbButton = cva(
  "inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide nb-border nb-press disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
  {
    variants: {
      tone: {
        yellow: "bg-nb-yellow text-nb-ink",
        pink: "bg-nb-pink text-nb-ink",
        mint: "bg-nb-mint text-nb-ink",
        blue: "bg-nb-blue text-nb-ink",
        coral: "bg-nb-coral text-nb-ink",
        purple: "bg-nb-purple text-nb-ink",
        white: "bg-white text-nb-ink",
        ink: "bg-nb-ink text-white",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-md nb-shadow-sm",
        md: "h-11 px-5 text-sm rounded-lg nb-shadow",
        lg: "h-14 px-7 text-base rounded-xl nb-shadow-lg",
        icon: "h-11 w-11 rounded-lg nb-shadow",
        iconSm: "h-9 w-9 rounded-md nb-shadow-sm",
      },
    },
    defaultVariants: { tone: "yellow", size: "md" },
  },
);

export interface NbButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof nbButton> {}

export const NbButton = forwardRef<HTMLButtonElement, NbButtonProps>(
  ({ className, tone, size, ...props }, ref) => (
    <button ref={ref} className={cn(nbButton({ tone, size }), className)} {...props} />
  ),
);
NbButton.displayName = "NbButton";

/* ---------- NB Card ---------- */
const nbCard = cva("nb-border bg-card text-card-foreground", {
  variants: {
    tone: {
      white: "bg-white",
      yellow: "bg-nb-yellow",
      pink: "bg-nb-pink",
      mint: "bg-nb-mint",
      blue: "bg-nb-blue",
      coral: "bg-nb-coral",
      purple: "bg-nb-purple",
      cream: "bg-nb-cream",
      ink: "bg-nb-ink text-white",
    },
    shadow: {
      sm: "nb-shadow-sm rounded-md",
      md: "nb-shadow rounded-lg",
      lg: "nb-shadow-lg rounded-xl",
      xl: "nb-shadow-xl rounded-2xl",
    },
  },
  defaultVariants: { tone: "white", shadow: "md" },
});

export interface NbCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof nbCard> {}

export const NbCard = forwardRef<HTMLDivElement, NbCardProps>(
  ({ className, tone, shadow, ...props }, ref) => (
    <div ref={ref} className={cn(nbCard({ tone, shadow }), className)} {...props} />
  ),
);
NbCard.displayName = "NbCard";

/* ---------- NB Input ---------- */
export const NbInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full nb-border rounded-lg bg-white px-3 text-sm font-medium nb-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black placeholder:text-muted-foreground/70",
        className,
      )}
      {...props}
    />
  ),
);
NbInput.displayName = "NbInput";

/* ---------- NB Textarea ---------- */
export const NbTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full nb-border rounded-lg bg-white p-3 text-sm font-medium nb-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black placeholder:text-muted-foreground/70",
        className,
      )}
      {...props}
    />
  ),
);
NbTextarea.displayName = "NbTextarea";

/* ---------- NB Badge ---------- */
const nbBadge = cva(
  "inline-flex items-center gap-1 nb-border rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide nb-shadow-sm",
  {
    variants: {
      tone: {
        yellow: "bg-nb-yellow text-nb-ink",
        pink: "bg-nb-pink text-nb-ink",
        mint: "bg-nb-mint text-nb-ink",
        blue: "bg-nb-blue text-nb-ink",
        coral: "bg-nb-coral text-nb-ink",
        purple: "bg-nb-purple text-nb-ink",
        white: "bg-white text-nb-ink",
        ink: "bg-nb-ink text-white",
      },
    },
    defaultVariants: { tone: "white" },
  },
);

export interface NbBadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof nbBadge> {}

export const NbBadge = ({ className, tone, ...props }: NbBadgeProps) => (
  <span className={cn(nbBadge({ tone }), className)} {...props} />
);

export const NB_TONES = ["yellow", "pink", "mint", "blue", "coral", "purple"] as const;
export type NbTone = (typeof NB_TONES)[number];

export const NB_COLOR_MAP: Record<string, NbTone> = {
  "#FFD93D": "yellow",
  "#FF6B9D": "pink",
  "#6BCB77": "mint",
  "#4D96FF": "blue",
  "#FF6B6B": "coral",
  "#B388EB": "purple",
};

export const NB_HEX: Record<NbTone, string> = {
  yellow: "#FFD93D",
  pink: "#FF6B9D",
  mint: "#6BCB77",
  blue: "#4D96FF",
  coral: "#FF6B6B",
  purple: "#B388EB",
};

export function hexToTone(hex: string): NbTone {
  return NB_COLOR_MAP[hex] ?? "yellow";
}

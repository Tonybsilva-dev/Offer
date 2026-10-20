import { Badge as UiBadge } from "@/components/ui/badge";

const TONES = {
  neutral: "border-foreground bg-card text-foreground",
  success: "border-success bg-success/15 text-success",
  warning: "border-warning bg-warning/20 text-foreground",
  danger: "border-destructive bg-destructive/10 text-destructive",
} as const;

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return (
    <UiBadge variant="outline" className={TONES[tone]}>
      {children}
    </UiBadge>
  );
}

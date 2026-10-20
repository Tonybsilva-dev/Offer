/** Cores do tema "Feira" (mesmos valores OKLCH de globals.css, modo claro) convertidas para hex. */
const OKLCH = {
  background: [0.965, 0.02, 85],
  card: [0.99, 0.01, 85],
  ink: [0.2, 0.045, 215],
  primary: [0.42, 0.09, 205],
  accent: [0.76, 0.165, 58],
  muted: [0.47, 0.035, 215],
} as const;

function oklchToHex([L, C, hue]: readonly [number, number, number]): string {
  const a = C * Math.cos((hue * Math.PI) / 180);
  const b = C * Math.sin((hue * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const channel = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255).toString(16).padStart(2, "0");
  };
  return `#${linear.map(channel).join("")}`;
}

export type BrandTheme = Record<keyof typeof OKLCH, string>;

export const BRAND_THEME = Object.fromEntries(
  Object.entries(OKLCH).map(([name, value]) => [name, oklchToHex(value)]),
) as BrandTheme;

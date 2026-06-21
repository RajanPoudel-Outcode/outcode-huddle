/**
 * Theme color helper.
 *
 * This app uses a single (light) palette defined in `@/constants/theme`, so this
 * just returns the caller-provided override (or a sensible default). Kept for
 * compatibility with the template components that still import it.
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName?: string,
) {
  const theme = useColorScheme() ?? "light";
  return props[theme] ?? Colors.text.primary;
}

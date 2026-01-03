/**
 * Styled Components Theme Type Declaration
 * 
 * Augments the styled-components DefaultTheme interface with the
 * design tokens from @repo/ui.
 */

import "styled-components";
import type { TokenTheme } from "@repo/ui";

declare module "styled-components" {
  export interface DefaultTheme extends TokenTheme {}
}

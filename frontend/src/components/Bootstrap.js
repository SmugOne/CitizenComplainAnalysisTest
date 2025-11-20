// url=https://github.com/acerosalinas/CitizenComplainAnalysisTest/blob/main/frontend/components/Bootstrap.js
import React from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";
import Bootstrap from "react-bootstrap"; // For web-specific styles (if needed)

/**
 * Lightweight "bootstrap-like" utility for React Native / react-native-web.
 * - Container: centers content and constrains maxWidth
 * - Row: simple flex row with wrap
 * - Col: accepts xs/sm/md/lg props (1-12) to compute width percentages
 * - ScrollableContainer: ScrollView wrapper ensuring vertical scrollability
 * - useResponsive: hook returning size flags and breakpoints
 *
 * Breakpoints (px): xs: 0, sm: 600, md: 900, lg: 1200
 */

export const BREAKPOINTS = {
  sm: 600,
  md: 900,
  lg: 1200,
};

export const TOKENS = {
  maxContentWidth: 1200,
  gutters: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
  },
  borderRadius: 12,
};

export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isXs: width < BREAKPOINTS.sm,
    isSm: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isMd: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLg: width >= BREAKPOINTS.lg,
  };
}

/**
 * Container: centers a child column and caps its width to tokens.maxContentWidth
 * Props:
 * - style: additional style for the wrapper
 * - fluid: if true, container is full width (no maxWidth)
 */
export function Container({ children, style, fluid = false, ...rest }) {
  const { width } = useWindowDimensions();
  const maxWidth = TOKENS.maxContentWidth;
  const computedWidth = fluid ? "100%" : Math.min(maxWidth, width - 24);
  return (
    <View style={[{ width: computedWidth, alignSelf: "center" }, style]} {...rest}>
      {children}
    </View>
  );
}

/**
 * Row: flex row that wraps
 * Props:
 * - gutter: spacing between columns (overrides tokens)
 */
export function Row({ children, style, gutter, ...rest }) {
  return (
    <View
      style={[
        styles.row,
        gutter != null ? { marginHorizontal: -gutter / 2 } : undefined,
        style,
      ]}
      {...rest}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { __gutter: gutter ?? TOKENS.gutters.md })
          : child
      )}
    </View>
  );
}

/**
 * Col: simple responsive column. Accepts xs, sm, md, lg (1-12).
 * Example: <Col xs={12} sm={6} md={4}>...</Col>
 *
 * Implementation: calculates flexBasis percentage based on the currently active breakpoint.
 */
export function Col({ children, xs, sm, md, lg, style, __gutter, ...rest }) {
  const { width, isXs, isSm, isMd, isLg } = useResponsive();
  // choose the column count depending on breakpoint; fallback to xs
  const cols = isLg ? (lg ?? md ?? sm ?? xs) : isMd ? (md ?? sm ?? xs) : isSm ? (sm ?? xs) : xs;
  const colCount = Math.max(1, Math.min(12, Number(cols ?? 12)));
  const percent = `${(colCount / 12) * 100}%`;
  // gutter spacing (left/right)
  const g = __gutter ?? TOKENS.gutters.md;
  return (
    <View style={[{ paddingHorizontal: g / 2, paddingVertical: g / 2, width: percent, minWidth: 0 }, style]} {...rest}>
      {children}
    </View>
  );
}

/**
 * ScrollableContainer: ensures vertical scroll when content exceeds viewport
 * Accepts same props as ScrollView
 */
export function ScrollableContainer({ children, contentStyle, style, ...rest }) {
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      style={[{ width: "100%" }, style]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "stretch",
    paddingBottom: Platform.OS === "web" ? 32 : 20,
  },
});
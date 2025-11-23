import React from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";

/**
 * Enhanced Bootstrap-like utility for React Native / react-native-web.
 * NEW FEATURES:
 * - Offset columns (offset props)
 * - Column ordering (order props)
 * - Alignment utilities (justify, align props on Row)
 * - Spacing utilities (m, p props)
 * - Hidden utilities (hidden props for responsive visibility)
 */

export const BREAKPOINTS = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1600, // Added XL breakpoint
};

export const TOKENS = {
  maxContentWidth: 1200,
  gutters: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
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
    isLg: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isXl: width >= BREAKPOINTS.xl,
  };
}

/**
 * Container: centers a child column and caps its width
 * Props:
 * - style: additional style for the wrapper
 * - fluid: if true, container is full width (no maxWidth)
 * - maxWidth: custom max width (overrides default)
 */
export function Container({ children, style, fluid = false, maxWidth, ...rest }) {
  const { width } = useWindowDimensions();
  const max = maxWidth ?? TOKENS.maxContentWidth;
  const computedWidth = fluid ? "100%" : Math.min(max, width - 24);
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
 * - justify: flex justify-content (flex-start, center, flex-end, space-between, space-around, space-evenly)
 * - align: flex align-items (flex-start, center, flex-end, stretch, baseline)
 * - noWrap: if true, disables flex wrap
 */
export function Row({ children, style, gutter, justify, align, noWrap = false, ...rest }) {
  return (
    <View
      style={[
        styles.row,
        gutter != null ? { marginHorizontal: -gutter / 2 } : undefined,
        justify ? { justifyContent: justify } : undefined,
        align ? { alignItems: align } : undefined,
        noWrap ? { flexWrap: "nowrap" } : undefined,
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
 * Col: responsive column with enhanced features
 * Props:
 * - xs, sm, md, lg, xl: column span (1-12)
 * - offsetXs, offsetSm, offsetMd, offsetLg, offsetXl: offset columns
 * - orderXs, orderSm, orderMd, orderLg, orderXl: flex order
 * - hiddenXs, hiddenSm, hiddenMd, hiddenLg, hiddenXl: hide at breakpoint
 * - align: align-self override
 */
export function Col({ 
  children, 
  xs, sm, md, lg, xl,
  offsetXs, offsetSm, offsetMd, offsetLg, offsetXl,
  orderXs, orderSm, orderMd, orderLg, orderXl,
  hiddenXs, hiddenSm, hiddenMd, hiddenLg, hiddenXl,
  align,
  style, 
  __gutter, 
  ...rest 
}) {
  const { width, isXs, isSm, isMd, isLg, isXl } = useResponsive();
  
  // Determine column span
  const cols = isXl ? (xl ?? lg ?? md ?? sm ?? xs) 
    : isLg ? (lg ?? md ?? sm ?? xs) 
    : isMd ? (md ?? sm ?? xs) 
    : isSm ? (sm ?? xs) 
    : xs;
  const colCount = Math.max(1, Math.min(12, Number(cols ?? 12)));
  const percent = `${(colCount / 12) * 100}%`;
  
  // Determine offset
  const offset = isXl ? offsetXl 
    : isLg ? offsetLg 
    : isMd ? offsetMd 
    : isSm ? offsetSm 
    : offsetXs;
  const offsetPercent = offset ? `${(offset / 12) * 100}%` : undefined;
  
  // Determine order
  const order = isXl ? orderXl 
    : isLg ? orderLg 
    : isMd ? orderMd 
    : isSm ? orderSm 
    : orderXs;
  
  // Determine visibility
  const isHidden = (isXs && hiddenXs) || 
    (isSm && hiddenSm) || 
    (isMd && hiddenMd) || 
    (isLg && hiddenLg) || 
    (isXl && hiddenXl);
  
  if (isHidden) return null;
  
  const g = __gutter ?? TOKENS.gutters.md;
  
  return (
    <View 
      style={[
        { 
          paddingHorizontal: g / 2, 
          paddingVertical: g / 2, 
          width: percent, 
          minWidth: 0 
        },
        offsetPercent ? { marginLeft: offsetPercent } : undefined,
        order !== undefined ? { order } : undefined,
        align ? { alignSelf: align } : undefined,
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
}

/**
 * Spacing utility component
 * Props:
 * - m, mt, mr, mb, ml: margin (uses TOKENS.spacing or custom number)
 * - p, pt, pr, pb, pl: padding (uses TOKENS.spacing or custom number)
 * Example: <Spacer m="md" pt="lg">...</Spacer>
 */
export function Spacer({ children, m, mt, mr, mb, ml, p, pt, pr, pb, pl, style, ...rest }) {
  const getSpacing = (val) => {
    if (typeof val === 'number') return val;
    return TOKENS.spacing[val] ?? 0;
  };
  
  const spacingStyle = {
    margin: m !== undefined ? getSpacing(m) : undefined,
    marginTop: mt !== undefined ? getSpacing(mt) : undefined,
    marginRight: mr !== undefined ? getSpacing(mr) : undefined,
    marginBottom: mb !== undefined ? getSpacing(mb) : undefined,
    marginLeft: ml !== undefined ? getSpacing(ml) : undefined,
    padding: p !== undefined ? getSpacing(p) : undefined,
    paddingTop: pt !== undefined ? getSpacing(pt) : undefined,
    paddingRight: pr !== undefined ? getSpacing(pr) : undefined,
    paddingBottom: pb !== undefined ? getSpacing(pb) : undefined,
    paddingLeft: pl !== undefined ? getSpacing(pl) : undefined,
  };
  
  return (
    <View style={[spacingStyle, style]} {...rest}>
      {children}
    </View>
  );
}

/**
 * Card component with consistent styling
 * Props:
 * - elevated: adds shadow/elevation
 * - bordered: adds border instead of shadow
 */
export function Card({ children, style, elevated = true, bordered = false, ...rest }) {
  return (
    <View 
      style={[
        styles.card,
        elevated && styles.cardElevated,
        bordered && styles.cardBordered,
        style
      ]} 
      {...rest}
    >
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

/**
 * Visibility utility - show/hide based on breakpoints
 * Props:
 * - xs, sm, md, lg, xl: boolean to show at that breakpoint
 */
export function Visible({ children, xs, sm, md, lg, xl }) {
  const responsive = useResponsive();
  
  const shouldShow = (responsive.isXs && xs) ||
    (responsive.isSm && sm) ||
    (responsive.isMd && md) ||
    (responsive.isLg && lg) ||
    (responsive.isXl && xl);
  
  if (!shouldShow) return null;
  return <>{children}</>;
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
  card: {
    backgroundColor: '#fff',
    borderRadius: TOKENS.borderRadius,
    padding: TOKENS.spacing.md,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBordered: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
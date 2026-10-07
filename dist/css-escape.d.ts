/**
 * CSSOM "serialize an identifier" (the behavior of CSS.escape).
 * Safe page ids and the shipped filter field names pass through unchanged.
 * A UUID that starts with a digit is escaped the way CSS.escape escapes a leading digit.
 */
export declare function cssEscape(value: string): string;
//# sourceMappingURL=css-escape.d.ts.map
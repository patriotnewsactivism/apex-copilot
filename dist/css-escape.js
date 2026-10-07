/**
 * CSSOM "serialize an identifier" (the behavior of CSS.escape).
 * Safe page ids and the shipped filter field names pass through unchanged.
 * A UUID that starts with a digit is escaped the way CSS.escape escapes a leading digit.
 */
export function cssEscape(value) {
    const characters = Array.from(value);
    let result = '';
    for (let index = 0; index < characters.length; index += 1) {
        const character = characters[index] ?? '';
        const code = character.codePointAt(0) ?? 0;
        if (code === 0) {
            result += '\uFFFD';
            continue;
        }
        if ((code >= 0x1 && code <= 0x1f)
            || code === 0x7f
            || (index === 0 && code >= 0x30 && code <= 0x39)
            || (index === 1 && code >= 0x30 && code <= 0x39 && characters[0] === '-')) {
            result += `\\${code.toString(16)} `;
            continue;
        }
        if (index === 0 && characters.length === 1 && character === '-') {
            result += `\\${character}`;
            continue;
        }
        if (code >= 0x80
            || character === '-'
            || character === '_'
            || (code >= 0x30 && code <= 0x39)
            || (code >= 0x41 && code <= 0x5a)
            || (code >= 0x61 && code <= 0x7a)) {
            result += character;
            continue;
        }
        result += `\\${character}`;
    }
    return result;
}
//# sourceMappingURL=css-escape.js.map
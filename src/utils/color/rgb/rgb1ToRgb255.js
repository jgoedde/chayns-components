export default function rgb1ToRgb255(rgb) {
    return {
        r: Math.round(rgb.r * 255),
        g: Math.round(rgb.g * 255),
        b: Math.round(rgb.b * 255),
        a: typeof rgb.a === 'number' && !isNaN(rgb.a) ? rgb.a : 1, /* eslint-disable-line no-restricted-globals */
    };
}

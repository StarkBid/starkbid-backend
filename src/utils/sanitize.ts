import xss from "xss";

export const sanitizeText = (text: string): string => {
    return xss(text.trim(), {
        whiteList: {}, // No tags allowed
        stripIgnoreTag: true, // Strip all tags
        stripIgnoreTagBody: ['script'], // Strip script tags and their content
    });
}

export const sanitizeSocials = (input: any) => {
    return {
        x: sanitizeText(input?.x || ''),
        insta: sanitizeText(input?.insta || ''),
        discord: sanitizeText(input?.discord || ''),
        telegram: sanitizeText(input?.telegram || ''),
    }
}

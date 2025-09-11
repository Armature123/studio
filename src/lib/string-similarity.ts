
function getBigrams(str: string): Map<string, number> {
    const bigrams = new Map<string, number>();
    const len = str.length;
    for (let i = 0; i < len - 1; i++) {
        const bigram = str.substring(i, i + 2);
        bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
}

export function similar(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const s1 = str1.replace(/\s+/g, ' ').toLowerCase();
    const s2 = str2.replace(/\s+/g, ' ').toLowerCase();

    if (s1.length < 2 || s2.length < 2) return 0.0;

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);

    let intersectionSize = 0;
    for (const [bigram, count1] of bigrams1.entries()) {
        if (bigrams2.has(bigram)) {
            intersectionSize += Math.min(count1, bigrams2.get(bigram)!);
        }
    }

    const totalBigrams = (s1.length - 1) + (s2.length - 1);
    if (totalBigrams === 0) return 1.0;

    return (2.0 * intersectionSize) / totalBigrams;
}

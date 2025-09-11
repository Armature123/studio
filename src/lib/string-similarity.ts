
// A simple implementation of Dice's Coefficient.
function getBigrams(str: string): string[] {
    const bigrams = new Set<string>();
    const len = str.length;
    for (let i = 0; i < len - 1; i++) {
        bigrams.add(str.substring(i, i + 2));
    }
    return Array.from(bigrams);
}

export function similar(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;
    
    str1 = str1.replace(/\s+/g, ' ').toLowerCase();
    str2 = str2.replace(/\s+/g, ' ').toLowerCase();

    const bigrams1 = getBigrams(str1);
    const bigrams2 = getBigrams(str2);

    const intersection = new Set(bigrams1.filter(bigram => bigrams2.includes(bigram)));
    const intersectionSize = intersection.size;

    return (2 * intersectionSize) / (bigrams1.length + bigrams2.length);
}

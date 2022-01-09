import ignore from "ignore";

export interface CodeOwnerEntry {
    case: string;
    owners: string[];
}

interface CodeOwnerMatcher extends CodeOwnerEntry {
    matcher: (path: string) => boolean;
}

export class CodeOwners {
    public readonly codeOwnerMatchers: CodeOwnerMatcher[] = [];

    constructor(codeOwnerText: string) {
        for (const line of codeOwnerText.split(/[\n\r]/u)) {
            const trimedLine = line.trim();
            if (trimedLine.length == 0) {
                continue;
            }
            if (trimedLine.startsWith("#")) {
                continue;
            }

            const [path, ...owners] = trimedLine.split(/[\s]/u);
            const ownerCommentIndex = owners.findIndex((x) => x.startsWith("#"));
            const trimedOwners = owners
                .slice(0, ownerCommentIndex < 0 ? owners.length : ownerCommentIndex)
                .filter((x) => x.length != 0)
                .filter((x) => x.startsWith("@"));

            if (0 < trimedOwners.length) {
                this.codeOwnerMatchers.push({
                    case: path,
                    owners: trimedOwners,
                    matcher: (x) => ignore().add(path).ignores(x),
                });
            }
        }
    }

    getCodeOwnerEntries(paths: string[]): CodeOwnerEntry[] {
        const result: CodeOwnerEntry[] = [];

        for (const path of paths) {
            for (const matcher of this.codeOwnerMatchers) {
                if (matcher.matcher(path)) {
                    result.push(matcher);
                }
            }
        }

        return result.filter((x, index, array) => array.findIndex((y) => x.case == y.case) == index);
    }
}

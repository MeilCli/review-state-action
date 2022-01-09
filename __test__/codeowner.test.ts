import { CodeOwners, CodeOwnerEntry } from "../src/codeowners";

test("codeOwnerEntry", () => {
    const codeOwners = new CodeOwners(`
*.ts @MeilCli
src/generated/* @MeilCli-bot
src/* @MeilCli @MeilCli-bot
dist/* @MeilCli #comment @MeilCli-bot
    `);
    const entries = codeOwners.codeOwnerMatchers;

    expect(entries.length).toBe(4);
    expect(entries[0].case).toBe("*.ts");
    expect(entries[0].owners).toStrictEqual(["@MeilCli"]);
    expect(entries[1].case).toBe("src/generated/*");
    expect(entries[1].owners).toStrictEqual(["@MeilCli-bot"]);
    expect(entries[2].case).toBe("src/*");
    expect(entries[2].owners).toStrictEqual(["@MeilCli", "@MeilCli-bot"]);
    expect(entries[3].case).toBe("dist/*");
    expect(entries[3].owners).toStrictEqual(["@MeilCli"]);
});

test("codeowner", () => {
    const codeOwners = new CodeOwners(`
*.ts @MeilCli
src/generated/* @MeilCli-bot
src/** @MeilCli
    `);
    expect(codeOwners.getCodeOwnerEntries(["main.ts", "test.ts"])).toMatchObject([
        { case: "*.ts", owners: ["@MeilCli"] },
    ] as CodeOwnerEntry[]);
    expect(codeOwners.getCodeOwnerEntries(["src/generated/query.ts"])).toMatchObject([
        { case: "*.ts", owners: ["@MeilCli"] },
        { case: "src/generated/*", owners: ["@MeilCli-bot"] },
        { case: "src/**", owners: ["@MeilCli"] },
    ] as CodeOwnerEntry[]);
    expect(codeOwners.getCodeOwnerEntries(["src/test.ts"])).toMatchObject([
        { case: "*.ts", owners: ["@MeilCli"] },
        { case: "src/**", owners: ["@MeilCli"] },
    ] as CodeOwnerEntry[]);
});

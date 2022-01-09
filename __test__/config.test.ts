import { getConfigFromYaml } from "../src/config";

const testFull = `
all:
  required-approvals: 1 # or default
groups:
  - name: "Test Group"
    members:
      - "@MeilCli"
      - "@MeilCli-bot"
    responsibility-paths:
      - "src/*.ts"
      - "*.md"
    required-approvals: 2
  - name: "Fake Group"
    members:
      - "@Fake"
codeowners:
  - path: "src/*.ts"
    required-approvals: 1
  - path: "*.md"
    required-approvals: 2
report:
  show-requested-reviewer: false
  show-groups-detail: false
  show-codeowners-detail: false
`;

test("testFull", () => {
    const config = getConfigFromYaml(testFull);

    expect(config.all.requiredApprovals).toBe(1);

    expect(config.groups.length).toBe(2);
    expect(config.groups[0].name).toBe("Test Group");
    expect(config.groups[0].members.length).toBe(2);
    expect(config.groups[0].members[0]).toBe("@MeilCli");
    expect(config.groups[0].members[1]).toBe("@MeilCli-bot");
    if (config.groups[0].responsibilityPaths != null) {
        expect(config.groups[0].responsibilityPaths.length).toBe(2);
        expect(config.groups[0].responsibilityPaths[0]).toBe("src/*.ts");
        expect(config.groups[0].responsibilityPaths[1]).toBe("*.md");
    } else {
        throw Error("config.groups[0].responsibilityPaths is null");
    }
    expect(config.groups[0].requiredApprovals).toBe(2);
    expect(config.groups[1].name).toBe("Fake Group");
    expect(config.groups[1].members.length).toBe(1);
    expect(config.groups[1].members[0]).toBe("@Fake");

    expect(config.codeOwners.length).toBe(2);
    expect(config.codeOwners[0].path).toBe("src/*.ts");
    expect(config.codeOwners[0].requiredApprovals).toBe(1);
    expect(config.codeOwners[1].path).toBe("*.md");
    expect(config.codeOwners[1].requiredApprovals).toBe(2);

    expect(config.report.showRequestedReviewer).toBe(false);
    expect(config.report.showGroupsDetail).toBe(false);
    expect(config.report.showCodeOwnersDetail).toBe(false);
});

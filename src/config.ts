import * as yaml from "js-yaml";

export const defaultAllRequiredApprovals = "default";
export const defaultShowRequestedReviewer = true;
export const defaultShowGroupsDetail = true;
export const defaultShowCodeOwnersDetail = true;

export interface Config {
    all: ConfigAll;
    groups: ConfigGroup[];
    codeOwners: ConfigCodeOwner[];
    report: ConfigReport;
}

export interface ConfigAll {
    requiredApprovals: number | "default" | null;
}

export interface ConfigGroup {
    name: string;
    members: string[];
    responsibilityPaths: string[] | null;
    requiredApprovals: number | null;
}

export interface ConfigCodeOwner {
    path: string;
    requiredApprovals: number;
}

export interface ConfigReport {
    showRequestedReviewer: boolean;
    showGroupsDetail: boolean;
    showCodeOwnersDetail: boolean;
}

interface YamlRoot {
    all: YamlAll | undefined;
    groups: YamlGroup[] | undefined;
    codeowners: YamlCodeOwner[] | undefined;
    report: YamlReport | undefined;
}

interface YamlAll {
    "required-approvals": number | string | undefined;
}

interface YamlGroup {
    name: string | undefined;
    members: string[] | undefined;
    "responsibility-paths": string[] | undefined;
    "required-approvals": number | undefined;
}

interface YamlCodeOwner {
    path: string | undefined;
    "required-approvals": number | undefined;
}

interface YamlReport {
    "show-requested-reviewer": boolean | undefined;
    "show-groups-detail": boolean | undefined;
    "show-codeowners-detail": boolean | undefined;
}

export function getConfigFromYaml(text: string): Config {
    const root = yaml.load(text) as YamlRoot;
    let allRequiredApprovals: number | "default" = defaultAllRequiredApprovals;
    if (typeof root?.all?.["required-approvals"] == "number") {
        allRequiredApprovals = root.all["required-approvals"];
    } else if (root.all?.["required-approvals"] != "default") {
        throw Error("invalid all.required-approvals at config");
    }
    const all: ConfigAll = {
        requiredApprovals: allRequiredApprovals,
    };
    const groups: ConfigGroup[] = [];
    if (root.groups != undefined) {
        for (const group of root.groups) {
            if (group.name == undefined) {
                throw Error("invalid groups.name at config");
            }
            if (group.members == undefined || group.members.length == 0) {
                throw Error("invalid groups.members at config");
            }
            groups.push({
                name: group.name,
                members: group.members,
                responsibilityPaths: group["responsibility-paths"] ?? null,
                requiredApprovals: group["required-approvals"] ?? null,
            });
        }
    }
    const codeOwners: ConfigCodeOwner[] = [];
    if (root.codeowners != undefined) {
        for (const codeOwner of root.codeowners) {
            if (codeOwner.path == undefined) {
                throw Error("invalid codeowners.path at config");
            }
            if (codeOwner["required-approvals"] == undefined) {
                throw Error("invalid codeowners.required-approvals at config");
            }
            codeOwners.push({
                path: codeOwner.path,
                requiredApprovals: codeOwner["required-approvals"],
            });
        }
    }
    const report: ConfigReport = {
        showRequestedReviewer: root.report?.["show-requested-reviewer"] ?? defaultShowRequestedReviewer,
        showGroupsDetail: root.report?.["show-groups-detail"] ?? defaultShowGroupsDetail,
        showCodeOwnersDetail: root.report?.["show-codeowners-detail"] ?? defaultShowCodeOwnersDetail,
    };
    return {
        all,
        groups,
        codeOwners,
        report,
    };
}

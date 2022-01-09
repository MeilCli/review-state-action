import * as core from "@actions/core";

export interface Option {
    githubToken: string;
    configPath: string;
    testOrNull: string | null;
}

export function getOption(): Option {
    return {
        githubToken: getInput("github_token"),
        configPath: getInput("config"),
        testOrNull: getInputOrNull("test_or_null"),
    };
}

function getInput(key: string): string {
    return core.getInput(key, { required: true });
}

function getInputOrNull(key: string): string | null {
    const result = core.getInput(key, { required: false });
    if (result.length == 0) {
        return null;
    }
    return result;
}

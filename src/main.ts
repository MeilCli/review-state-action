import * as core from "@actions/core";
import * as github from "@actions/github";
import { getOption } from "./option";
import { getConfigFromYaml } from "./config";
import { githubClient } from "./client";
import { calcuateReviewState } from "./calculate";
import { searchCode, showCode } from "./git";
import { CodeOwners } from "./codeowners";

const codeOwnerFileName = "CODEOWNERS";
const codeOwnerPaths: string[] = ["CODEOWNERS", "docs/CODEOWNERS ", ".github/CODEOWNERS "];

async function run() {
    try {
        const option = getOption();
        const client = githubClient(option);
        if (github.context.payload.pull_request == null) {
            throw Error("not pull request payload");
        }
        const baseRef = process.env.GITHUB_BASE_REF as string;
        const configText = await showCode(baseRef, option.configPath);
        const config = await getConfigFromYaml(configText);

        const reviewState = await calcuateReviewState(
            client,
            github.context.repo.owner,
            github.context.repo.repo,
            github.context.payload.pull_request.number
        );

        const codeOwnerSuggestPaths = await searchCode(baseRef, codeOwnerFileName);
        const codeOwnerFilePath = codeOwnerPaths.find((x) => codeOwnerSuggestPaths.includes(x));
        if (codeOwnerFilePath != undefined) {
            const codeOwnerText = await showCode(baseRef, codeOwnerFilePath);
            const codeOwners = new CodeOwners(codeOwnerText);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

import {
    GetPullRequestTimelineQueryVariables,
    GetPullRequestChangedFileQueryVariables,
    GetTeamMemberQueryVariables,
} from "./generated/graphql";
import { GitHubClient } from "./client";
import {
    GetPullRequestTimelineQueryPullRequestTimelineNode,
    GetPullRequestChangedFileQueryPullRequestFileNode,
    GetTeamMemberQueryTeamMemberNode,
} from "./types";

// gurad for infinity loop
const maxLoop = 100;

export async function getPullRequestTimelineWithPaging(
    client: GitHubClient,
    variables: GetPullRequestTimelineQueryVariables
): Promise<GetPullRequestTimelineQueryPullRequestTimelineNode[]> {
    const result: GetPullRequestTimelineQueryPullRequestTimelineNode[] = [];

    let response = await client.getPullRequestTimeline(variables);
    let pageInfo = response.repository?.pullRequest?.timelineItems.pageInfo;
    if (
        response.repository?.pullRequest?.timelineItems?.nodes == null ||
        response.repository?.pullRequest?.timelineItems?.nodes == undefined
    ) {
        return result;
    }
    for (const node of response.repository?.pullRequest?.timelineItems?.nodes) {
        if (node == null || node == undefined) {
            continue;
        }
        result.push(node);
    }

    let loopCount = 0;
    while (
        pageInfo != null &&
        pageInfo != undefined &&
        pageInfo.hasNextPage &&
        pageInfo.endCursor != null &&
        pageInfo.endCursor != undefined
    ) {
        loopCount += 1;
        response = await client.getPullRequestTimeline({ ...variables, after: pageInfo.endCursor });
        pageInfo = response.repository?.pullRequest?.timelineItems.pageInfo;

        if (
            response.repository?.pullRequest?.timelineItems?.nodes == null ||
            response.repository?.pullRequest?.timelineItems?.nodes == undefined
        ) {
            return result;
        }
        for (const node of response.repository?.pullRequest?.timelineItems?.nodes) {
            if (node == null || node == undefined) {
                continue;
            }
            result.push(node);
        }

        if (maxLoop <= loopCount) {
            throw Error("infinity loop detected");
        }
    }

    return result;
}

export async function getPullRequestChangedFileWithPaging(
    client: GitHubClient,
    variables: GetPullRequestChangedFileQueryVariables
): Promise<GetPullRequestChangedFileQueryPullRequestFileNode[]> {
    const result: GetPullRequestChangedFileQueryPullRequestFileNode[] = [];

    let response = await client.getPullRequestChangedFile(variables);
    let pageInfo = response.repository?.pullRequest?.files?.pageInfo;
    if (
        response.repository?.pullRequest?.files?.nodes == null ||
        response.repository.pullRequest.files.nodes == undefined
    ) {
        return result;
    }
    for (const node of response.repository.pullRequest.files.nodes) {
        if (node == null || node == undefined) {
            continue;
        }
        result.push(node);
    }

    let loopCount = 0;
    while (
        pageInfo != null &&
        pageInfo != undefined &&
        pageInfo.hasNextPage &&
        pageInfo.endCursor != null &&
        pageInfo.endCursor != undefined
    ) {
        loopCount += 1;
        response = await client.getPullRequestChangedFile({ ...variables, after: pageInfo.endCursor });
        pageInfo = response.repository?.pullRequest?.files?.pageInfo;

        if (
            response.repository?.pullRequest?.files?.nodes == null ||
            response.repository.pullRequest.files.nodes == undefined
        ) {
            return result;
        }
        for (const node of response.repository.pullRequest.files.nodes) {
            if (node == null || node == undefined) {
                continue;
            }
            result.push(node);
        }

        if (maxLoop <= loopCount) {
            throw Error("infinity loop detected");
        }
    }

    return result;
}

export async function getTeamMemberWithPaging(
    client: GitHubClient,
    variables: GetTeamMemberQueryVariables
): Promise<GetTeamMemberQueryTeamMemberNode[]> {
    const result: GetTeamMemberQueryTeamMemberNode[] = [];

    let response = await client.getTeamMember(variables);
    let pageInfo = response.organization?.team?.members.pageInfo;
    if (response.organization?.team?.members.nodes == null || response.organization.team.members.nodes == undefined) {
        return result;
    }
    for (const node of response.organization.team.members.nodes) {
        if (node == null || node == undefined) {
            continue;
        }
        result.push(node);
    }

    let loopCount = 0;
    while (
        pageInfo != null &&
        pageInfo != undefined &&
        pageInfo.hasNextPage &&
        pageInfo.endCursor != null &&
        pageInfo.endCursor != undefined
    ) {
        loopCount += 1;
        response = await client.getTeamMember({ ...variables, after: pageInfo.endCursor });
        pageInfo = response.organization?.team?.members.pageInfo;

        if (
            response.organization?.team?.members.nodes == null ||
            response.organization.team.members.nodes == undefined
        ) {
            return result;
        }
        for (const node of response.organization.team.members.nodes) {
            if (node == null || node == undefined) {
                continue;
            }
            result.push(node);
        }

        if (maxLoop <= loopCount) {
            throw Error("infinity loop detected");
        }
    }

    return result;
}

import { GitHubClient } from "./client";
import { PullRequestReviewState } from "./generated/graphql";
import { getPullRequestTimelineWithPaging, getTeamMemberWithPaging } from "./paging";
import { GetPullRequestTimelineQueryPullRequestTimelineNode } from "./types";

export interface User {
    login: string;
}

export interface Organization {
    login: string;
}

export interface Team {
    organization: Organization;
    slug: string;
    members: User[];
}

type TypedUser = { __typename: "User" } & User;
type TypedTeam = { __typename: "Team" } & Team;
export type ReviewActor = TypedUser | TypedTeam;

export interface ReviewState {
    requested: ReviewActor[];
    approved: User[];
}

export async function calcuateReviewState(
    client: GitHubClient,
    owner: string,
    repository: string,
    pullRequest: number
): Promise<ReviewState> {
    const timeline = await getPullRequestTimelineWithPaging(client, {
        owner,
        name: repository,
        pull_request: pullRequest,
    });

    const requested = await calculateReviewRequested(client, timeline);
    const approved = calculateReviewApproved(timeline);

    return { requested: requested, approved: approved };
}

async function calculateReviewRequested(
    client: GitHubClient,
    timeline: GetPullRequestTimelineQueryPullRequestTimelineNode[]
): Promise<ReviewActor[]> {
    let requested: ReviewActor[] = [];

    for (const node of timeline) {
        if (
            node.__typename == "ReviewRequestedEvent" &&
            node.requestedReviewer != null &&
            node.requestedReviewer != undefined
        ) {
            const requestedReviewer = node.requestedReviewer;
            if (requestedReviewer.__typename == "User") {
                requested.push({ __typename: "User", login: requestedReviewer.login });
            }
            if (requestedReviewer.__typename == "Team") {
                requested.push({
                    __typename: "Team",
                    organization: { login: requestedReviewer.organization.login },
                    slug: requestedReviewer.slug,
                    members: [],
                });
            }
        }
        if (
            node.__typename == "ReviewRequestRemovedEvent" &&
            node.requestedReviewer != null &&
            node.requestedReviewer != undefined
        ) {
            const requestedReviewer = node.requestedReviewer;
            if (requestedReviewer.__typename == "User") {
                requested = requested.filter(
                    (x) => (x.__typename == "User" && x.login == requestedReviewer.login) == false
                );
            }
            if (requestedReviewer.__typename == "Team") {
                requested = requested.filter(
                    (x) =>
                        (x.__typename == "Team" &&
                            x.organization.login == requestedReviewer.organization.login &&
                            x.slug == requestedReviewer.slug) == false
                );
            }
        }
    }

    // remove duplicate
    requested = requested.filter(
        (x, index, array) =>
            array.findIndex(
                (y) =>
                    (x.__typename == "User" && y.__typename == "User" && x.login == y.login) ||
                    (x.__typename == "Team" &&
                        y.__typename == "Team" &&
                        x.organization.login == y.organization.login &&
                        x.slug == y.slug)
            ) == index
    );

    const result: ReviewActor[] = [];

    for (const actor of requested) {
        if (actor.__typename == "User") {
            result.push(actor);
        } else if (actor.__typename == "Team") {
            const members = await getTeamMemberWithPaging(client, {
                organization: actor.organization.login,
                name: actor.slug,
            });
            result.push({ __typename: "Team", organization: actor.organization, slug: actor.slug, members: members });
        }
    }

    return result;
}

function calculateReviewApproved(timeline: GetPullRequestTimelineQueryPullRequestTimelineNode[]): User[] {
    let approved: User[] = [];

    for (const node of timeline) {
        if (node.__typename == "PullRequestReview" && node.author != null && node.author != undefined) {
            const author = node.author;
            if (author.__typename == "User" || author.__typename == "EnterpriseUserAccount") {
                if (node.state == PullRequestReviewState.Approved) {
                    approved.push({ login: author.login });
                } else if (node.state == PullRequestReviewState.ChangesRequested) {
                    approved = approved.filter((x) => (x.login == author.login) == false);
                }
            }
        }
        if (node.__typename == "ReviewDismissedEvent" && node.review != null && node.review != undefined) {
            const review = node.review;
            if (review.author?.__typename == "User" || review.author?.__typename == "EnterpriseUserAccount") {
                approved = approved.filter((x) => (x.login == review.author?.login) == false);
            }
        }
    }

    return approved;
}

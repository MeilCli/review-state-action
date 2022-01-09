import { MockedResponse, MockLink } from "@apollo/react-testing";
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import {
    GetPullRequestTimeline,
    GetPullRequestTimelineQuery,
    GetPullRequestTimelineQueryVariables,
    GetTeamMember,
    GetTeamMemberQuery,
    GetTeamMemberQueryVariables,
    PullRequestReviewState,
} from "../src/generated/graphql";
import { GitHubClient } from "../src/client";
import { calcuateReviewState, User, Team } from "../src/calculate";

function createMockClient(mocks: ReadonlyArray<MockedResponse>): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({
        cache: new InMemoryCache({ addTypename: true }),
        link: new MockLink(mocks, true),
    });
}

test("calcuateReviewState", async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: GetPullRequestTimeline,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: undefined,
                } as GetPullRequestTimelineQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    repository: {
                        __typename: "Repository",
                        pullRequest: {
                            __typename: "PullRequest",
                            timelineItems: {
                                __typename: "PullRequestTimelineItemsConnection",
                                pageInfo: { __typename: "PageInfo", hasNextPage: false, endCursor: "1" },
                                nodes: [
                                    {
                                        __typename: "ReviewRequestedEvent",
                                        requestedReviewer: {
                                            __typename: "Team",
                                            organization: { login: "fake-organization" },
                                            slug: "fake-team",
                                        },
                                    },
                                    {
                                        __typename: "ReviewRequestRemovedEvent",
                                        requestedReviewer: {
                                            __typename: "Team",
                                            organization: { login: "fake-organization" },
                                            slug: "fake-team",
                                        },
                                    },
                                    {
                                        __typename: "ReviewRequestedEvent",
                                        requestedReviewer: {
                                            __typename: "User",
                                            login: "MeilCli",
                                        },
                                    },
                                    {
                                        __typename: "ReviewRequestedEvent",
                                        requestedReviewer: {
                                            __typename: "User",
                                            login: "MeilCli-bot",
                                        },
                                    },
                                    {
                                        __typename: "ReviewRequestedEvent",
                                        requestedReviewer: {
                                            __typename: "Team",
                                            organization: { login: "MeilCli" },
                                            slug: "test-team",
                                        },
                                    },
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.ChangesRequested,
                                        author: { __typename: "User", login: "MeilCli" },
                                    },
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli" },
                                    },
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli-bot" },
                                    },
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "fake-user" },
                                    },
                                    {
                                        __typename: "ReviewDismissedEvent",
                                        review: {
                                            __typename: "PullRequestReview",
                                            author: { __typename: "User", login: "fake-user" },
                                        },
                                    },
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.ChangesRequested,
                                        author: { __typename: "User", login: "MeilCli-bot" },
                                    },
                                ],
                            },
                        },
                    },
                } as GetPullRequestTimelineQuery,
            },
        },
        {
            request: {
                query: GetTeamMember,
                variables: {
                    organization: "MeilCli",
                    name: "test-team",
                    after: undefined,
                } as GetTeamMemberQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    organization: {
                        __typename: "Organization",
                        team: {
                            __typename: "Team",
                            members: {
                                __typename: "TeamMemberConnection",
                                pageInfo: {
                                    hasNextPage: false,
                                    endCursor: "1",
                                },
                                nodes: [
                                    { __typename: "User", login: "MeilCli" },
                                    { __typename: "User", login: "MeilCli-bot" },
                                ],
                            },
                        },
                    },
                } as GetTeamMemberQuery,
            },
        },
        {
            request: {
                query: GetTeamMember,
                variables: {
                    organization: "fake-organization",
                    name: "fake-team",
                    after: undefined,
                } as GetTeamMemberQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    organization: {
                        __typename: "Organization",
                        team: {
                            __typename: "Team",
                            members: {
                                __typename: "TeamMemberConnection",
                                pageInfo: {
                                    hasNextPage: false,
                                    endCursor: "1",
                                },
                                nodes: [
                                    { __typename: "User", login: "MeilCli" },
                                    { __typename: "User", login: "MeilCli-bot" },
                                ],
                            },
                        },
                    },
                } as GetTeamMemberQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    const reviewState = await calcuateReviewState(client, "MeilCli", "review-state-action", 1);

    expect(reviewState.requested.length).toBe(3);
    expect(reviewState.requested[0]).toMatchObject({ login: "MeilCli" } as User);
    expect(reviewState.requested[1]).toMatchObject({ login: "MeilCli-bot" } as User);
    expect(reviewState.requested[2]).toMatchObject({
        organization: { login: "MeilCli" },
        slug: "test-team",
        members: [{ login: "MeilCli" }, { login: "MeilCli-bot" }],
    } as Team);

    expect(reviewState.approved.length).toBe(1);
    expect(reviewState.approved[0]).toMatchObject({ login: "MeilCli" } as User);
});

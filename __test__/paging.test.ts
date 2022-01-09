import { MockedResponse, MockLink } from "@apollo/react-testing";
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import {
    GetPullRequestTimeline,
    GetPullRequestTimelineQuery,
    GetPullRequestTimelineQueryVariables,
    GetPullRequestChangedFile,
    GetPullRequestChangedFileQuery,
    GetPullRequestChangedFileQueryVariables,
    GetTeamMember,
    GetTeamMemberQuery,
    GetTeamMemberQueryVariables,
    PullRequestReviewState,
} from "../src/generated/graphql";
import { GitHubClient } from "../src/client";
import {
    getPullRequestTimelineWithPaging,
    getPullRequestChangedFileWithPaging,
    getTeamMemberWithPaging,
} from "../src/paging";

function createMockClient(mocks: ReadonlyArray<MockedResponse>): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({
        cache: new InMemoryCache({ addTypename: true }),
        link: new MockLink(mocks, true),
    });
}

test("getPullRequestTimelineWithPaging", async () => {
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
                                pageInfo: { __typename: "PageInfo", hasNextPage: true, endCursor: "1" },
                                nodes: [
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli" },
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
                query: GetPullRequestTimeline,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: "1",
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
                                pageInfo: { __typename: "PageInfo", hasNextPage: false, endCursor: "2" },
                                nodes: [
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli-bot" },
                                    },
                                ],
                            },
                        },
                    },
                } as GetPullRequestTimelineQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    const result = await getPullRequestTimelineWithPaging(client, {
        owner: "MeilCli",
        name: "review-state-action",
        pull_request: 1,
    });

    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject({
        __typename: "PullRequestReview",
        state: PullRequestReviewState.Approved,
        author: { __typename: "User", login: "MeilCli" },
    });
    expect(result[1]).toMatchObject({
        __typename: "PullRequestReview",
        state: PullRequestReviewState.Approved,
        author: { __typename: "User", login: "MeilCli-bot" },
    });
});

test("getPullRequestTimelineWithPagingInfinityLoop", async () => {
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
                                pageInfo: { __typename: "PageInfo", hasNextPage: true, endCursor: "1" },
                                nodes: [
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli" },
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
                query: GetPullRequestTimeline,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: "1",
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
                                pageInfo: { __typename: "PageInfo", hasNextPage: true, endCursor: "1" },
                                nodes: [
                                    {
                                        __typename: "PullRequestReview",
                                        state: PullRequestReviewState.Approved,
                                        author: { __typename: "User", login: "MeilCli-bot" },
                                    },
                                ],
                            },
                        },
                    },
                } as GetPullRequestTimelineQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    await expect(
        getPullRequestTimelineWithPaging(client, {
            owner: "MeilCli",
            name: "review-state-action",
            pull_request: 1,
        })
    ).rejects.toThrow();
});

test("getPullRequestChangedFileWithPaging", async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: GetPullRequestChangedFile,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: undefined,
                } as GetPullRequestChangedFileQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    repository: {
                        __typename: "Repository",
                        pullRequest: {
                            __typename: "PullRequest",
                            files: {
                                __typename: "PullRequestChangedFileConnection",
                                pageInfo: {
                                    __typename: "PageInfo",
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "PullRequestChangedFile", path: "README.md" }],
                            },
                        },
                    },
                } as GetPullRequestChangedFileQuery,
            },
        },
        {
            request: {
                query: GetPullRequestChangedFile,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: "1",
                } as GetPullRequestChangedFileQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    repository: {
                        __typename: "Repository",
                        pullRequest: {
                            __typename: "PullRequest",
                            files: {
                                __typename: "PullRequestChangedFileConnection",
                                pageInfo: {
                                    __typename: "PageInfo",
                                    hasNextPage: false,
                                    endCursor: "2",
                                },
                                nodes: [{ __typename: "PullRequestChangedFile", path: "LICENSE.txt" }],
                            },
                        },
                    },
                } as GetPullRequestChangedFileQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    const result = await getPullRequestChangedFileWithPaging(client, {
        owner: "MeilCli",
        name: "review-state-action",
        pull_request: 1,
    });

    expect(result.length).toBe(2);
    expect(result[0].path).toBe("README.md");
    expect(result[1].path).toBe("LICENSE.txt");
});

test("getPullRequestChangedFileWithPagingInfinityLoop", async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: GetPullRequestChangedFile,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: undefined,
                } as GetPullRequestChangedFileQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    repository: {
                        __typename: "Repository",
                        pullRequest: {
                            __typename: "PullRequest",
                            files: {
                                __typename: "PullRequestChangedFileConnection",
                                pageInfo: {
                                    __typename: "PageInfo",
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "PullRequestChangedFile", path: "README.md" }],
                            },
                        },
                    },
                } as GetPullRequestChangedFileQuery,
            },
        },
        {
            request: {
                query: GetPullRequestChangedFile,
                variables: {
                    owner: "MeilCli",
                    name: "review-state-action",
                    pull_request: 1,
                    after: "1",
                } as GetPullRequestChangedFileQueryVariables,
            },
            result: {
                data: {
                    __typename: "Query",
                    repository: {
                        __typename: "Repository",
                        pullRequest: {
                            __typename: "PullRequest",
                            files: {
                                __typename: "PullRequestChangedFileConnection",
                                pageInfo: {
                                    __typename: "PageInfo",
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "PullRequestChangedFile", path: "LICENSE.txt" }],
                            },
                        },
                    },
                } as GetPullRequestChangedFileQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    await expect(
        getPullRequestChangedFileWithPaging(client, {
            owner: "MeilCli",
            name: "review-state-action",
            pull_request: 1,
        })
    ).rejects.toThrow();
});

test("getTeamMemberWithPaging", async () => {
    const mocks: MockedResponse[] = [
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
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "User", login: "MeilCli" }],
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
                    organization: "MeilCli",
                    name: "test-team",
                    after: "1",
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
                                    endCursor: "2",
                                },
                                nodes: [{ __typename: "User", login: "MeilCli-bot" }],
                            },
                        },
                    },
                } as GetTeamMemberQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    const result = await getTeamMemberWithPaging(client, { organization: "MeilCli", name: "test-team" });

    expect(result.length).toBe(2);
    expect(result[0].login).toBe("MeilCli");
    expect(result[1].login).toBe("MeilCli-bot");
});

test("getTeamMemberWithPagingInfinityLoop", async () => {
    const mocks: MockedResponse[] = [
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
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "User", login: "MeilCli" }],
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
                    organization: "MeilCli",
                    name: "test-team",
                    after: "1",
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
                                    hasNextPage: true,
                                    endCursor: "1",
                                },
                                nodes: [{ __typename: "User", login: "MeilCli-bot" }],
                            },
                        },
                    },
                } as GetTeamMemberQuery,
            },
        },
    ];

    const client = new GitHubClient(createMockClient(mocks));
    await expect(getTeamMemberWithPaging(client, { organization: "MeilCli", name: "test-team" })).rejects.toThrow();
});

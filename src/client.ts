import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { Option } from "./option";
import {
    GetPullRequestTimeline,
    GetPullRequestTimelineQuery,
    GetPullRequestTimelineQueryVariables,
    GetPullRequestChangedFile,
    GetPullRequestChangedFileQuery,
    GetPullRequestChangedFileQueryVariables,
    GetBranchProtection,
    GetBranchProtectionQuery,
    GetBranchProtectionQueryVariables,
    GetTeamMember,
    GetTeamMemberQuery,
    GetTeamMemberQueryVariables,
} from "./generated/graphql";

export function githubClient(option: Option): GitHubClient {
    return new GitHubClient(
        new ApolloClient({
            link: new HttpLink({
                uri: "https://api.github.com/graphql",
                headers: { authorization: `token ${option.githubToken}` },
            }),
            cache: new InMemoryCache(),
        })
    );
}

export class GitHubClient {
    constructor(private readonly client: ApolloClient<NormalizedCacheObject>) {}

    async getPullRequestTimeline(
        variables: GetPullRequestTimelineQueryVariables
    ): Promise<GetPullRequestTimelineQuery> {
        const result = await this.client.query<GetPullRequestTimelineQuery>({
            query: GetPullRequestTimeline,
            variables: variables,
        });
        return result.data;
    }

    async getPullRequestChangedFile(
        variables: GetPullRequestChangedFileQueryVariables
    ): Promise<GetPullRequestChangedFileQuery> {
        const result = await this.client.query<GetPullRequestChangedFileQuery>({
            query: GetPullRequestChangedFile,
            variables: variables,
        });
        return result.data;
    }

    async getBranchProtection(variables: GetBranchProtectionQueryVariables): Promise<GetBranchProtectionQuery> {
        const result = await this.client.query<GetBranchProtectionQuery>({
            query: GetBranchProtection,
            variables: variables,
        });
        return result.data;
    }

    async getTeamMember(variables: GetTeamMemberQueryVariables): Promise<GetTeamMemberQuery> {
        const result = await this.client.query<GetTeamMemberQuery>({
            query: GetTeamMember,
            variables: variables,
        });
        return result.data;
    }
}

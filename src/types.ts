import {
    GetPullRequestTimelineQuery,
    GetPullRequestChangedFileQuery,
    GetBranchProtectionQuery,
    GetTeamMemberQuery,
} from "./generated/graphql";

export type GetPullRequestTimelineQueryRepository = Exclude<
    GetPullRequestTimelineQuery["repository"],
    null | undefined
>;
export type GetPullRequestTimelineQueryPullRequest = Exclude<
    GetPullRequestTimelineQueryRepository["pullRequest"],
    null | undefined
>;
export type GetPullRequestTimelineQueryPullRequestTimeline = Exclude<
    GetPullRequestTimelineQueryPullRequest["timelineItems"],
    null | undefined
>;
export type GetPullRequestTimelineQueryPullRequestTimelineNodes = Exclude<
    GetPullRequestTimelineQueryPullRequestTimeline["nodes"],
    null | undefined
>;
export type GetPullRequestTimelineQueryPullRequestTimelineNode = Exclude<
    GetPullRequestTimelineQueryPullRequestTimelineNodes[number],
    null | undefined
>;

export type GetPullRequestChangedFileQueryRepository = Exclude<
    GetPullRequestChangedFileQuery["repository"],
    null | undefined
>;
export type GetPullRequestChangedFileQueryPullRequest = Exclude<
    GetPullRequestChangedFileQueryRepository["pullRequest"],
    null | undefined
>;
export type GetPullRequestChangedFileQueryPullRequestFile = Exclude<
    GetPullRequestChangedFileQueryPullRequest["files"],
    null | undefined
>;
export type GetPullRequestChangedFileQueryPullRequestFileNodes = Exclude<
    GetPullRequestChangedFileQueryPullRequestFile["nodes"],
    null | undefined
>;
export type GetPullRequestChangedFileQueryPullRequestFileNode = Exclude<
    GetPullRequestChangedFileQueryPullRequestFileNodes[number],
    null | undefined
>;

export type GetBranchProtectionQueryRepository = Exclude<GetBranchProtectionQuery["repository"], null | undefined>;
export type GetBranchProtectionQueryRef = Exclude<GetBranchProtectionQueryRepository["ref"], null | undefined>;

export type GetTeamMemberQueryOrganization = Exclude<GetTeamMemberQuery["organization"], null | undefined>;
export type GetTeamMemberQueryTeam = Exclude<GetTeamMemberQueryOrganization["team"], null | undefined>;
export type GetTeamMemberQueryTeamMember = Exclude<GetTeamMemberQueryTeam["members"], null | undefined>;
export type GetTeamMemberQueryTeamMemberNodes = Exclude<GetTeamMemberQueryTeamMember["nodes"], null | undefined>;
export type GetTeamMemberQueryTeamMemberNode = Exclude<GetTeamMemberQueryTeamMemberNodes[number], null | undefined>;

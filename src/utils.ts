import { GitHubIssueReference } from "./models";

const issueUrlRegex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i;

export const parseIssueUrl = (issueUrl: string): GitHubIssueReference | null => {
    const found = issueUrl.match(issueUrlRegex);
    if (!found) {
        return null;
    }

    return {
        repoOwner: found[1],
        repoName: found[2],
        issueNumber: parseInt(found[3]),
    };
};

export type NullablePartial<T> = { [P in keyof T]?: T[P] | null };

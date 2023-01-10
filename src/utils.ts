import { GitHubIssueReference } from "./models";

// Analogue of TypeScript "Partial" type but for null values
export type NullablePartial<T> = { [P in keyof T]: T[P] | null | undefined };

const issueUrlRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/i;
const issueUrlsRegex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/gi;

export const parseIssueUrl = (str: string): GitHubIssueReference | null => {
    const found = str.trim().match(issueUrlRegex);
    if (!found) {
        return null;
    }

    return {
        repoOwner: found[1],
        repoName: found[2],
        issueNumber: parseInt(found[3]),
    };
};

export const parseIssuesUrls = (str: string): GitHubIssueReference[] => {
    const result: GitHubIssueReference[] = [];

    for (const match of str.matchAll(issueUrlsRegex)) {
        result.push({
            repoOwner: match[1],
            repoName: match[2],
            issueNumber: parseInt(match[3]),
        });
    }

    return result;
};

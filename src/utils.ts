import { GitHubIssueReference, GitHubRepoReference } from "./models";

// Analogue of TypeScript "Partial" type but for null values
export type NullablePartial<T> = { [P in keyof T]: T[P] | null | undefined };

const issueUrlRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/i;
const issueNumberRegex = /^#(\d+)$/;
const issueUrlsRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)|#\d+/gi;

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

export const parseIssueNumber = (str: string, repoRef: GitHubRepoReference): GitHubIssueReference | null => {
    const found = str.trim().match(issueNumberRegex);
    if (!found) {
        return null;
    }

    return {
        repoOwner: repoRef.repoOwner,
        repoName: repoRef.repoName,
        issueNumber: parseInt(found[1]),
    };
};

export const parseIssuesUrls = (str: string, repoRef: GitHubRepoReference): GitHubIssueReference[] => {
    const result: GitHubIssueReference[] = [];

    for (const match of str.matchAll(issueUrlsRegex)) {
        const parsedIssue = parseIssueUrl(match[0]) || parseIssueNumber(match[0], repoRef);
        if (parsedIssue) {
            result.push(parsedIssue);
        }
    }

    return result;
};

export const wrapString = (str: string, maxWidth: number): string => {
    const words = str.split(/\s+/);

    let result = words[0];
    let lastLength = result.length;
    for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
        if (lastLength + words[wordIndex].length >= maxWidth) {
            result += "\n";
            lastLength = 0;
        } else {
            result += " ";
        }

        result += words[wordIndex];
        lastLength += words[wordIndex].length;
    }

    return result;
};

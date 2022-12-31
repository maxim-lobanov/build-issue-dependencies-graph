import { GitHubIssueReference } from "./models";
import { parseIssueUrl } from "./utils";

export interface Config {
    rootIssue: GitHubIssueReference;
    accessToken: string;
}

export const parseInputs = (): Config => {
    const rootIssueUrl = "https://github.com/maxim-lobanov/build-issue-dependencies-graph/issues/1";
    const rootIssue = parseIssueUrl(rootIssueUrl);
    if (!rootIssue) {
        throw new Error(`Failed to extract issue details from url '${rootIssueUrl}'`);
    }

    return {
        rootIssue,
        accessToken: "",
    };
};

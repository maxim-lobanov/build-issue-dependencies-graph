import * as core from "@actions/core";
import { GitHubIssueReference } from "./models";
import { parseIssueUrl } from "./utils";

export interface Config {
    rootIssue: GitHubIssueReference;
    sectionTitle: string;
    includeLegend: boolean;
    accessToken: string;
    dryRun: boolean;
}

export const parseInputs = (): Config => {
    const rootIssueUrl = core.getInput("root-issue-url", { required: true });
    const rootIssue = parseIssueUrl(rootIssueUrl);
    if (!rootIssue) {
        throw new Error(`Failed to extract issue details from url '${rootIssueUrl}'`);
    }

    return {
        rootIssue,
        sectionTitle: core.getInput("section-title", { required: true }),
        includeLegend: core.getBooleanInput("include-legend"),
        accessToken: core.getInput("access-token", { required: true }),
        dryRun: core.getBooleanInput("dry-run"),
    };
};

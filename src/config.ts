import * as core from "@actions/core";
import { GitHubIssueReference } from "./models";
import { parseIssueUrl } from "./utils";

export interface Inputs {
    rootIssue: GitHubIssueReference;
    sectionTitle: string;
    githubToken: string;
    includeLegend: boolean;
    includeFinishNode: boolean;
    dryRun: boolean;
}

export const parseInputs = (): Inputs => {
    const rootIssueUrl = core.getInput("root-issue-url", { required: true });
    const rootIssue = parseIssueUrl(rootIssueUrl);
    if (!rootIssue) {
        throw new Error(`Failed to extract issue details from url '${rootIssueUrl}'`);
    }

    return {
        rootIssue,
        sectionTitle: core.getInput("section-title", { required: true }),
        githubToken: core.getInput("github-token", { required: true }),
        includeLegend: core.getBooleanInput("include-legend"),
        includeFinishNode: core.getBooleanInput("include-finish-node"),
        dryRun: core.getBooleanInput("dry-run"),
    };
};

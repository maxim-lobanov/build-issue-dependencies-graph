import * as core from "@actions/core";
import { parseInputs } from "./config";
import { GitHubApiClient } from "./github-api-client";
import { GraphBuilder } from "./graph-builder";
import { IssueContentParser } from "./issue-content-parser";
import { MermaidNode } from "./mermaid-node";
import { MermaidRender } from "./mermaid-render";

const run = async (): Promise<void> => {
    try {
        const config = parseInputs();
        const githubApiClient = new GitHubApiClient(config.accessToken);
        const issueContentParser = new IssueContentParser();
        const mermaidRender = new MermaidRender(config.includeLegend);

        const rootIssue = await githubApiClient.getIssue(config.rootIssue);
        const rootIssueTasklist = issueContentParser.extractIssueTasklist(rootIssue);

        core.info(`Found ${rootIssueTasklist.length} work items in task list.`);

        core.info("Building dependency graph...");
        const graphBuilder = new GraphBuilder();
        for (const issueRef of rootIssueTasklist) {
            const issue = await githubApiClient.getIssue(issueRef);
            const issueDetails = MermaidNode.createFromGitHubIssue(issue);
            const issueDependencies = issueContentParser.extractIssueDependencies(issue);
            graphBuilder.addIssue(issueRef, issueDetails);
            issueDependencies.forEach(x => graphBuilder.addDependency(x, issueRef));
        }

        const graph = graphBuilder.getGraph();
        const renderedContent = mermaidRender.render(graph);

        core.startGroup("Mermaid diagram");
        core.info(renderedContent);
        core.endGroup();

        const updatedIssueContent = issueContentParser.replaceIssueContent(
            rootIssue,
            config.sectionTitle,
            renderedContent
        );

        core.startGroup("Updated issue content");
        core.info(updatedIssueContent);
        core.endGroup();

        if (config.dryRun) {
            console.log("Action is run in dry-run mode. Root issue won't be updated");
            return;
        }

        core.info("Updating root issue content...");
        await githubApiClient.updateIssueContent(config.rootIssue, updatedIssueContent);
        core.info("Root issue is updated.");
    } catch (error: unknown) {
        core.setFailed(error instanceof Error ? error.message : (error as string));
        throw error;
    }
};

run();

import * as core from "@actions/core";
import { parseInputs } from "./config";
import { GitHubApiClient } from "./github-api-client";
import { GraphBuilder } from "./graph-builder";
import { IssueContentParser } from "./issue-content-parser";
import { MermaidNode } from "./mermaid-node";
import { MermaidRender } from "./mermaid-render";

const run = async (): Promise<void> => {
    try {
        const inputs = parseInputs();
        const githubApiClient = new GitHubApiClient(inputs.githubToken);
        const issueContentParser = new IssueContentParser();
        const mermaidRender = new MermaidRender(inputs.includeLegend);

        const rootIssue = await githubApiClient.getIssue(inputs.rootIssue);
        const rootIssueTasklist = issueContentParser.extractIssueTasklist(rootIssue);

        core.info(`Found ${rootIssueTasklist.length} work items in task list.`);

        core.info("Building dependency graph...");
        const graphBuilder = new GraphBuilder(inputs.includeFinishNode);
        for (const issueRef of rootIssueTasklist) {
            const issue = await githubApiClient.getIssue(issueRef);
            const issueDetails = MermaidNode.createFromGitHubIssue(issue);
            const issueDependencies = issueContentParser.extractIssueDependencies(issue);
            graphBuilder.addIssue(issueRef, issueDetails);
            issueDependencies.forEach(x => graphBuilder.addDependency(x, issueRef));
        }

        const graph = graphBuilder.getGraph();
        const renderedContent = mermaidRender.render(graph);

        core.info("Rendering dependency graph into mermaid...");
        core.setOutput("mermaid-diagram", renderedContent);
        core.startGroup("Mermaid diagram");
        core.info(renderedContent);
        core.endGroup();
        
        core.info("Preparing updated root issue content...");
        const updatedIssueContent = issueContentParser.replaceIssueContent(
            rootIssue,
            inputs.sectionTitle,
            renderedContent
        );

        core.startGroup("Updated root issue content");
        core.info(updatedIssueContent);
        core.endGroup();

        if (inputs.dryRun) {
            console.log("Action is run in dry-run mode. Root issue won't be updated");
            return;
        }

        core.info("Updating root issue content...");
        await githubApiClient.updateIssueContent(inputs.rootIssue, updatedIssueContent);
        core.info("Root issue is updated.");
    } catch (error: unknown) {
        core.setFailed(error instanceof Error ? error.message : (error as string));
        throw error;
    }
};

run();

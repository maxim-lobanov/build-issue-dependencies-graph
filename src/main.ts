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
        const mermaidRender = new MermaidRender();

        const rootIssue = await githubApiClient.getIssue(config.rootIssue);
        const rootIssueTasklist = issueContentParser.extractIssueTasklist(rootIssue);

        const graphBuilder = new GraphBuilder();
        for (const issueRef of rootIssueTasklist) {
            const issue = await githubApiClient.getIssue(issueRef);
            const issueDetails = MermaidNode.fromGitHubIssue(issue);
            graphBuilder.addIssue(issueRef, issueDetails);

            const issueDependencies = issueContentParser.extractIssueDependencies(issue);
            issueDependencies.forEach(x => graphBuilder.addDependency(x, issueRef));
        }

        const graph = graphBuilder.getGraph();
        const renderedContent = mermaidRender.render(graph);
        console.log(renderedContent);

        const updatedIssueContent = issueContentParser.replaceIssueContent(
            rootIssue,
            config.sectionTitle,
            renderedContent
        );
        await githubApiClient.updateIssueContent(config.rootIssue, updatedIssueContent);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
            throw error;
        }
    }
};

run();

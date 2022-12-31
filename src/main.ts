import * as core from "@actions/core";
import { parseInputs } from "./config";
import { GraphBuilder } from "./graph-builder";
import { IssueContentParser } from "./issue-content-parser";
import { MermaidNode } from "./mermaid-node";
import { MermaidRender } from "./mermaid-render";

const run = async (): Promise<void> => {
    try {
        const config = parseInputs();
        const issueContentParser = new IssueContentParser(config.accessToken);
        const mermaidRender = new MermaidRender();

        const rootIssue = await issueContentParser.getIssue(config.rootIssue);
        const rootIssueTasklist = issueContentParser.extractIssueTasklist(rootIssue);

        const graphBuilder = new GraphBuilder();
        for (const issueRef of rootIssueTasklist) {
            const issue = await issueContentParser.getIssue(issueRef);
            const issueDetails = MermaidNode.fromGitHubIssue(issue);
            graphBuilder.addIssue(issueRef, issueDetails);

            const issueDependencies = issueContentParser.extractIssueDependencies(issue);
            issueDependencies.forEach(x => graphBuilder.addDependency(x, issueRef));
        }

        const graph = graphBuilder.getGraph();
        const renderedContent = mermaidRender.render(graph);

        console.log(renderedContent);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
};

run();

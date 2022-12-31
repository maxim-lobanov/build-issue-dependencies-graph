import { Graph, GraphEdge } from "./graph-builder";
import { MermaidNode } from "./mermaid-node";

export class MermaidRender {
    public render(graph: Graph): string {
        return `
\`\`\`mermaid
flowchart TD
${this.renderCssSection()}
${this.renderLegendSection()}
${this.renderIssuesSection(graph.vertices)}
${this.renderDependencies(graph.edges)}
\`\`\`
`;
    }

    private renderCssSection(): string {
        return `
%% <CSS>

classDef notstarted fill:#FFF,color:#000;
classDef started fill:#fae17d,color:#000;
classDef completed fill:#ccffd8,color:#000;

%% </CSS>
`;
    }

    private renderLegendSection(): string {
        return `
%% <Legend>

subgraph legend["Legend"]
    direction LR;
    notstarted("Issue is not started"):::notstarted;
    started("Issue is in progress"):::started;
    completed("Issue is done"):::completed;
    notstarted --> started --> completed;
end

%% </Legend>
`;
    }

    private renderIssuesSection(issues: MermaidNode[]): string {
        const renderedGraphIssues = issues.map(x => this.renderIssue(x)).join("\n\n");

        return `
%% <Issues>

${renderedGraphIssues}

%% </Issues>
`;
    }

    private renderIssue(issue: MermaidNode): string {
        let result = `${issue.nodeId}("${issue.title}"):::${issue.status};`;
        if (issue.url) {
            result += `\nclick ${issue.nodeId} href "${issue.url}" _blank;`;
        }

        return result;
    }

    private renderDependencies(dependencies: GraphEdge[]): string {
        const renderedDependencies = dependencies.map(x => this.renderDependency(x)).join("\n");

        return `
%% <Dependencies>

${renderedDependencies}

%% </Dependencies>
`;
    }

    private renderDependency(dependency: GraphEdge): string {
        return `${dependency.from.nodeId} --> ${dependency.to.nodeId};`;
    }
}

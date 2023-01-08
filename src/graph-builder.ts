import { MermaidNode } from "./mermaid-node";
import { GitHubIssueReference } from "./models";
import { NullablePartial } from "./utils";

export interface GraphEdge {
    from: MermaidNode;
    to: MermaidNode;
}

export interface Graph {
    vertices: MermaidNode[];
    edges: GraphEdge[];
}

interface InternalGraphNode {
    value?: MermaidNode;
    predecessors: InternalGraphNode[];
    successors: InternalGraphNode[];
}

export class GraphBuilder {
    private readonly nodes = new Map<string, InternalGraphNode>();

    constructor(private readonly includeFinishNode: boolean) {}

    private buildNodeKey(issueRef: GitHubIssueReference): string {
        return `${issueRef.repoOwner}/${issueRef.repoName}/${issueRef.issueNumber}`;
    }

    private getOrCreateGraphNode(issueReference: GitHubIssueReference, issue?: MermaidNode): InternalGraphNode {
        const nodeKey = this.buildNodeKey(issueReference);
        let graphNode = this.nodes.get(nodeKey);
        if (!graphNode) {
            graphNode = { value: issue, predecessors: [], successors: [] };
            this.nodes.set(nodeKey, graphNode);
        }

        return graphNode;
    }

    public addIssue(issueReference: GitHubIssueReference, issue: MermaidNode): void {
        this.getOrCreateGraphNode(issueReference, issue);
    }

    public addDependency(from: GitHubIssueReference, to: GitHubIssueReference) {
        const fromNode = this.getOrCreateGraphNode(from);
        const toNode = this.getOrCreateGraphNode(to);

        fromNode.successors.push(toNode);
        toNode.predecessors.push(fromNode);
    }

    public getGraph(): Graph {
        const graphNodes = Array.from(this.nodes.values());
        const vertices = graphNodes.map(x => x.value).filter((x): x is MermaidNode => x !== null);

        const startNode = MermaidNode.createStartNode();
        const finishNode = this.includeFinishNode ? MermaidNode.createFinishNode() : null;

        const edgesFromStartNode: NullablePartial<GraphEdge>[] = graphNodes
            .filter(x => x.predecessors.length === 0)
            .map(x => ({ from: startNode, to: x.value }));
        // No need to look at 'includeFinishNode' here. Edges to finish node will be filtered by 'filterNullEdges' later
        // because finishNode is null
        const edgesToFinishNode: NullablePartial<GraphEdge>[] = graphNodes
            .filter(x => x.successors.length === 0)
            .map(x => ({ from: x.value, to: finishNode }));
        const internalEdges: NullablePartial<GraphEdge>[] = graphNodes
            .map(x => x.successors.map(y => ({ from: x.value, to: y.value })))
            .flat();

        const allVertices = [startNode, ...vertices, finishNode].filter(this.filterNullVertices);
        const allEdges = [...edgesFromStartNode, ...internalEdges, ...edgesToFinishNode].filter(this.filterNullEdges);

        return {
            vertices: allVertices,
            edges: allEdges,
        };
    }

    private filterNullVertices(x: MermaidNode | null): x is MermaidNode {
        return Boolean(x);
    }

    private filterNullEdges(x: NullablePartial<GraphEdge>): x is GraphEdge {
        return Boolean(x) && Boolean(x.from) && Boolean(x.to);
    }
}

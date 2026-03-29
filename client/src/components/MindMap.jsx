import { useMemo } from 'react'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const NODE_COLORS = [
  '#58a6ff',
  '#a855f7',
  '#22d3ee',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#f87171',
]

/** Horizontal gap between sibling subtrees (px). */
const H_GAP = 48
/** Vertical distance between tree levels (px). */
const V_GAP = 152

/** Approximate node width from label length (avoids overlap from long text). */
function estimateNodeWidth(label) {
  const s = String(label || '')
  const len = s.length
  const charW = 7.5
  const pad = 44
  return Math.round(Math.min(300, Math.max(112, len * charW + pad)))
}

/**
 * Width of the full subtree rooted at `node` (so siblings don't collide).
 */
function measureSubtree(node) {
  const selfW = estimateNodeWidth(node.label)
  const kids = node.children || []
  if (kids.length === 0) {
    return { width: selfW, selfW }
  }
  const parts = kids.map((k) => measureSubtree(k))
  const rowW = parts.reduce((acc, m, i) => acc + m.width + (i > 0 ? H_GAP : 0), 0)
  return { width: Math.max(selfW, rowW), selfW }
}

function nodeStyle(depth) {
  const c = NODE_COLORS[depth % NODE_COLORS.length]
  return {
    background: c,
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '12px 18px',
    fontSize: depth === 0 ? '15px' : '13px',
    fontWeight: depth === 0 ? '700' : '600',
    minWidth: '104px',
    maxWidth: '280px',
    textAlign: 'center',
    whiteSpace: 'normal',
    lineHeight: 1.35,
    wordBreak: 'break-word',
    boxShadow: '0 10px 28px rgba(0,0,0,0.38)',
  }
}

/**
 * Place nodes: `left` = left edge of this subtree's bounding box in flow space.
 */
function buildLayout(node, left, y, depth, path) {
  const { width, selfW } = measureSubtree(node)
  const nodeX = left + (width - selfW) / 2
  const id = `n-${path.join('-')}`

  const nodeEntry = {
    id,
    position: { x: nodeX, y },
    data: { label: node.label },
    style: nodeStyle(depth),
  }

  const kids = node.children || []
  if (kids.length === 0) {
    return { nodes: [nodeEntry], edges: [], rootId: id }
  }

  const childMeasures = kids.map((k) => measureSubtree(k))
  const rowW = childMeasures.reduce((acc, m, i) => acc + m.width + (i > 0 ? H_GAP : 0), 0)
  let childLeft = left + (width - rowW) / 2

  const allNodes = [nodeEntry]
  const allEdges = []

  kids.forEach((child, i) => {
    const cw = childMeasures[i].width
    const sub = buildLayout(child, childLeft, y + V_GAP, depth + 1, [...path, i])
    allEdges.push({
      id: `e-${id}-${sub.rootId}`,
      source: id,
      target: sub.rootId,
      type: 'smoothstep',
      style: { stroke: 'rgba(88, 166, 255, 0.5)', strokeWidth: 2 },
    })
    allNodes.push(...sub.nodes)
    allEdges.push(...sub.edges)
    childLeft += cw + H_GAP
  })

  return { nodes: allNodes, edges: allEdges, rootId: id }
}

export default function MindMap({ mindMap }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!mindMap?.label) return { initialNodes: [], initialEdges: [] }
    const { nodes, edges } = buildLayout(mindMap, 0, 0, 0, [0])
    return { initialNodes: nodes, initialEdges: edges }
  }, [mindMap])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  if (!mindMap?.label) {
    return <p className="text-[#484f58]">No mind map data available.</p>
  }

  return (
    <div className="min-h-[min(560px,70vh)] h-[min(92vh,1100px)] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#010409] ring-1 ring-white/[0.04]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.22, maxZoom: 1.75 }}
        minZoom={0.18}
        maxZoom={2}
        attributionPosition="bottom-left"
        nodesConnectable={false}
        elevateEdgesOnSelect
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: 'rgba(88, 166, 255, 0.45)', strokeWidth: 2 },
        }}
      >
        <Background color="rgba(88, 166, 255, 0.06)" gap={22} />
        <Controls />
      </ReactFlow>
    </div>
  )
}

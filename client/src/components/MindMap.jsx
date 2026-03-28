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

function buildNodesAndEdges(tree, x = 0, y = 0, depth = 0, index = 0) {
  const nodes = []
  const edges = []
  const id = `node-${depth}-${index}`

  nodes.push({
    id,
    position: { x, y },
    data: { label: tree.label },
    style: {
      background: NODE_COLORS[depth % NODE_COLORS.length],
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '8px 16px',
      fontSize: depth === 0 ? '14px' : '12px',
      fontWeight: depth === 0 ? '700' : '500',
      minWidth: '120px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    },
  })

  const children = tree.children || []
  const spacing = 200
  const startX = x - ((children.length - 1) * spacing) / 2

  children.forEach((child, i) => {
    const childId = `node-${depth + 1}-${index * 10 + i}`
    const childX = startX + i * spacing
    const childY = y + 120

    const { nodes: childNodes, edges: childEdges } = buildNodesAndEdges(
      child,
      childX,
      childY,
      depth + 1,
      index * 10 + i
    )

    edges.push({
      id: `edge-${id}-${childId}`,
      source: id,
      target: childId,
      style: { stroke: 'rgba(88, 166, 255, 0.45)', strokeWidth: 2 },
    })

    nodes.push(...childNodes)
    edges.push(...childEdges)
  })

  return { nodes, edges }
}

export default function MindMap({ mindMap }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!mindMap?.label) return { initialNodes: [], initialEdges: [] }
    const { nodes, edges } = buildNodesAndEdges(mindMap)
    return { initialNodes: nodes, initialEdges: edges }
  }, [mindMap])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  if (!mindMap?.label) {
    return <p className="text-[#484f58]">No mind map data available.</p>
  }

  return (
    <div className="h-[500px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#010409] ring-1 ring-white/[0.04]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-left"
      >
        <Background color="rgba(88, 166, 255, 0.06)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}

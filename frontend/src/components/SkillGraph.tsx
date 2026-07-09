import React, { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import axios from 'axios'

interface SkillNode {
  id: string
  name: string
  category: string
  confidence: number
  x?: number
  y?: number
}

interface SkillLink {
  source: string
  target: string
}

const SkillGraph: React.FC = () => {
  const [graph, setGraph] = useState<{ nodes: SkillNode[]; links: SkillLink[] }>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 280 })

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: 280 })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const [skillRes, taxRes] = await Promise.all([
          axios.get<SkillNode[]>('/api/skills'),
          fetch('/config/skill_taxonomy.json').then(r => r.json()),
        ])
        const nodes = skillRes.data.map(s => ({
          id: s.name,
          name: s.name,
          category: s.category,
          confidence: s.confidence,
        }))
        const nodeIds = new Set(nodes.map(n => n.id))
        const links: SkillLink[] = []
        nodes.forEach(node => {
          const parents: string[] = taxRes[node.name] || []
          parents.forEach(p => {
            if (nodeIds.has(p)) links.push({ source: p, target: node.id })
          })
        })
        setGraph({ nodes, links })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const paintNode = (node: SkillNode, ctx: CanvasRenderingContext2D, gs: number) => {
    const label = node.name
    const fontSize = Math.max(10, 12 / gs)
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    const tw = ctx.measureText(label).width
    const pad = 5 / gs
    const rw = tw + pad * 2
    const rh = fontSize + pad * 2
    const rx = (node.x ?? 0) - rw / 2
    const ry = (node.y ?? 0) - rh / 2
    const radius = 4 / gs

    // Rounded rect
    const isTech = node.category === 'technical'
    ctx.beginPath()
    ctx.moveTo(rx + radius, ry)
    ctx.lineTo(rx + rw - radius, ry)
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius)
    ctx.lineTo(rx + rw, ry + rh - radius)
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh)
    ctx.lineTo(rx + radius, ry + rh)
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius)
    ctx.lineTo(rx, ry + radius)
    ctx.quadraticCurveTo(rx, ry, rx + radius, ry)
    ctx.closePath()

    // Fill with gradient-like colour based on confidence
    const alpha = 0.6 + (node.confidence / 100) * 0.4
    ctx.fillStyle = isTech
      ? `rgba(0, 210, 172, ${alpha * 0.85})`
      : `rgba(123, 97, 255, ${alpha * 0.85})`
    ctx.fill()

    // Border
    ctx.strokeStyle = isTech ? 'rgba(0, 210, 172, 0.9)' : 'rgba(123, 97, 255, 0.9)'
    ctx.lineWidth = 1 / gs
    ctx.stroke()

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, node.x ?? 0, node.y ?? 0)
  }

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Skill Map</p>
          <h3 className="text-lg font-semibold text-white">Knowledge Graph</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(0, 210, 172, 0.8)' }} />
            Technical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(123, 97, 255, 0.8)' }} />
            Soft
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          height: 280,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading graph…</div>
        ) : graph.nodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
            <span className="text-3xl">🔗</span>
            No skills yet. Submit your profile first.
          </div>
        ) : (
          <ForceGraph2D
            graphData={graph as any}
            nodeCanvasObject={paintNode as any}
            nodeCanvasObjectMode={() => 'replace'}
            linkColor={() => 'rgba(148,163,184,0.25)'}
            linkWidth={1}
            backgroundColor="transparent"
            width={dims.w}
            height={dims.h}
            cooldownTicks={80}
            nodeRelSize={6}
          />
        )}
      </div>

      {graph.nodes.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Drag nodes to rearrange · Scroll to zoom · Node brightness = confidence
        </p>
      )}
    </div>
  )
}

export default SkillGraph

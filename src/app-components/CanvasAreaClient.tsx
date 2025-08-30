"use client"

import { useAppStore } from "@/lib/store"
import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Circle, Shape, Line } from "react-konva"
import type Konva from "konva"

export default function CanvasAreaClient() {
  // Pegando cada fatia separadamente (melhor performance e sem erro de tipagem)
  const nodes = useAppStore((state) => state.nodes)
  const supports = useAppStore((state) => state.supports)
  const members = useAppStore((state) => state.members)
  const activeTool = useAppStore((state) => state.activeTool)
  const startNodeForMember = useAppStore((state) => state.startNodeForMember)
  const actions = useAppStore((state) => state.actions)

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }) // Estado para posição do mouse

  // Redimensiona o canvas conforme o container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    window.addEventListener("resize", updateSize)
    updateSize()
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return

    const nearbyNode = actions.findNodeNear(pos.x, pos.y)

    switch (activeTool) {
      case "node":
        if (!nearbyNode) actions.addNode(pos.x, pos.y)
        break
      case "pin-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "pin")
        break
      case "roller-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "roller")
        break
      case "member":
        if (nearbyNode) {
          if (!startNodeForMember) {
            actions.setStartNodeForMember(nearbyNode.id)
          } else {
            actions.addMember(startNodeForMember, nearbyNode.id)
            actions.setStartNodeForMember(null)
          }
        }
        break
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (pos) setMousePos(pos)
  }

  const startNode = startNodeForMember
    ? nodes.find((n) => n.id === startNodeForMember)
    : null

  return (
    <div
      ref={containerRef}
      className="flex-grow cursor-crosshair rounded-lg border border-stone-200 bg-stone-50 shadow-inner"
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {/* Linha de preview ao criar barra */}
          {activeTool === "member" && startNode && (
            <Line
              points={[startNode.x, startNode.y, mousePos.x, mousePos.y]}
              stroke="#9ca3af"
              strokeWidth={2}
              dash={[10, 5]}
            />
          )}

          {/* Desenha as barras */}
          {members.map((member) => {
            const n1 = nodes.find((n) => n.id === member.startNodeId)
            const n2 = nodes.find((n) => n.id === member.endNodeId)
            if (!n1 || !n2) return null
            return (
              <Line
                key={member.id}
                points={[n1.x, n1.y, n2.x, n2.y]}
                stroke="black"
                strokeWidth={4}
              />
            )
          })}

          {/* Desenha os nós */}
          {nodes.map((node) => (
            <Circle
              key={node.id}
              x={node.x}
              y={node.y}
              radius={6}
              fill="black"
            />
          ))}

          {/* Desenha os apoios */}
          {supports.map((support) => {
            const node = nodes.find((n) => n.id === support.nodeId)
            if (!node) return null

            return (
              <Shape
                key={support.id}
                x={node.x}
                y={node.y}
                sceneFunc={(context, shape) => {
                  context.beginPath()
                  if (support.type === "pin") {
                    context.moveTo(-10, 10)
                    context.lineTo(0, 0)
                    context.lineTo(10, 10)
                    context.closePath()
                  } else if (support.type === "roller") {
                    context.moveTo(-10, 10)
                    context.lineTo(0, 0)
                    context.lineTo(10, 10)
                    context.closePath()
                    context.moveTo(-12, 12)
                    context.lineTo(12, 12)
                    context.moveTo(-7, 14)
                    context.arc(-5, 14, 2, 0, Math.PI * 2, false)
                    context.moveTo(7, 14)
                    context.arc(5, 14, 2, 0, Math.PI * 2, false)
                  }
                  context.fillStrokeShape(shape)
                }}
                fill="#34d399"
                stroke="black"
                strokeWidth={1}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}

"use client"

import { useAppStore } from "@/lib/store"
import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Circle, Shape, Line, Arrow, Text } from "react-konva"
import type Konva from "konva"

export default function CanvasAreaClient() {
  // Buscando fatias do estado
  const nodes = useAppStore((state) => state.nodes)
  const supports = useAppStore((state) => state.supports)
  const members = useAppStore((state) => state.members)
  const pointLoads = useAppStore((state) => state.pointLoads)
  const momentLoads = useAppStore((state) => state.momentLoads)
  const results = useAppStore((state) => state.results)
  const activeTool = useAppStore((state) => state.activeTool)
  const startNodeForMember = useAppStore((state) => state.startNodeForMember)
  const currentFy = useAppStore((state) => state.currentFy)
  const currentMz = useAppStore((state) => state.currentMz)
  const actions = useAppStore((state) => state.actions)

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Efeito para redimensionar o canvas
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

  // Handler para cliques no canvas
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
      case "pin-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "pin")
        break
      case "roller-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "roller")
        break
      case "fixed-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "fixed")
        break
      case "point-load":
        if (nearbyNode) actions.addPointLoad(nearbyNode.id, 0, currentFy) // Fx é 0 conforme a UI
        break
      case "moment-load":
        if (nearbyNode) actions.addMomentLoad(nearbyNode.id, currentMz)
        break
    }
  }

  // Handler para movimento do mouse
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
                  if (support.type === "fixed") {
                    context.moveTo(0, -15)
                    context.lineTo(0, 15)
                    context.moveTo(0, -12)
                    context.lineTo(8, -18)
                    context.moveTo(0, -6)
                    context.lineTo(8, -12)
                    context.moveTo(0, 0)
                    context.lineTo(8, -6)
                    context.moveTo(0, 6)
                    context.lineTo(8, 0)
                    context.moveTo(0, 12)
                    context.lineTo(8, 6)
                  } else if (support.type === "pin") {
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

          {/* Desenha as Cargas Pontuais */}
          {pointLoads.map((load) => {
            const node = nodes.find((n) => n.id === load.nodeId)
            if (!node) return null
            const scale = 4
            return (
              <Arrow
                key={load.id}
                points={[
                  node.x,
                  node.y,
                  node.x + load.fx * scale,
                  node.y + load.fy * scale,
                ]}
                pointerLength={8}
                pointerWidth={8}
                fill="#f43f5e"
                stroke="#9f1239"
                strokeWidth={2}
              />
            )
          })}

          {/* Desenha as Cargas de Momento */}
          {momentLoads.map((load) => {
            const node = nodes.find((n) => n.id === load.nodeId)
            if (!node) return null
            const isClockwise = load.mz > 0
            return (
              <Shape
                key={load.id}
                x={node.x}
                y={node.y}
                sceneFunc={(ctx, shape) => {
                  ctx.beginPath()
                  ctx.arc(0, 0, 15, -Math.PI / 2, Math.PI, !isClockwise)
                  // Seta
                  const angle = isClockwise ? Math.PI - 0.3 : -Math.PI / 2 - 0.3
                  const arrowX = 15 * Math.cos(angle)
                  const arrowY = 15 * Math.sin(angle)
                  const arrowSize = 5
                  ctx.moveTo(
                    arrowX - arrowSize * Math.cos(angle - Math.PI / 4),
                    arrowY - arrowSize * Math.sin(angle - Math.PI / 4),
                  )
                  ctx.lineTo(arrowX, arrowY)
                  ctx.lineTo(
                    arrowX - arrowSize * Math.cos(angle + Math.PI / 4),
                    arrowY - arrowSize * Math.sin(angle + Math.PI / 4),
                  )
                  ctx.strokeShape(shape)
                }}
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            )
          })}

          {/* Desenha as Reações de Apoio */}
          {results &&
            results.reactions.map((reaction) => {
              const node = nodes.find((n) => n.id === reaction.nodeId)
              if (!node) return null

              const scale = 4
              const { fx, fy, mz } = reaction

              const arrowX = Math.abs(fx) > 0.01 && (
                <Arrow
                  key={`${reaction.id}-x`}
                  points={[node.x, node.y, node.x + fx * scale, node.y]}
                  pointerLength={8}
                  pointerWidth={8}
                  fill="#3b82f6"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                />
              )

              const arrowY = Math.abs(fy) > 0.01 && (
                <Arrow
                  key={`${reaction.id}-y`}
                  points={[node.x, node.y, node.x, node.y + fy * scale]}
                  pointerLength={8}
                  pointerWidth={8}
                  fill="#3b82f6"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                />
              )

              const text = (Math.abs(fx) > 0.01 || Math.abs(fy) > 0.01) && (
                <Text
                  key={`${reaction.id}-text`}
                  x={node.x + 15}
                  y={node.y + 15}
                  text={`Fx: ${fx.toFixed(2)}\nFy: ${fy.toFixed(2)}`}
                  fontSize={12}
                  fill="#1e3a8a"
                />
              )

              const momentText = Math.abs(mz) > 0.01 && (
                <Text
                  key={`${reaction.id}-mz`}
                  x={node.x + 15}
                  y={node.y - 25}
                  text={`Mz: ${mz.toFixed(2)}`}
                  fontSize={12}
                  fill="#1e3a8a"
                  fontStyle="bold"
                />
              )

              return [arrowX, arrowY, text, momentText]
            })}
        </Layer>
      </Stage>
    </div>
  )
}

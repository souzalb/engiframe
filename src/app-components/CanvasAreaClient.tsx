"use client"

import { useAppStore } from "@/lib/store"
import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Circle, Shape } from "react-konva"
import type Konva from "konva"

export default function CanvasAreaClient() {
  const nodes = useAppStore((state) => state.nodes)
  const supports = useAppStore((state) => state.supports)
  const activeTool = useAppStore((state) => state.activeTool)
  const actions = useAppStore((state) => state.actions)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Efeito para redimensionar o canvas quando a janela muda de tamanho
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
    updateSize() // Define o tamanho inicial
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return

    // Verifica se o clique foi perto de um nó existente
    const nearbyNode = actions.findNodeNear(pos.x, pos.y)

    // Executa a ação correspondente à ferramenta ativa
    switch (activeTool) {
      case "node":
        // Apenas adiciona um nó se não clicou perto de um já existente
        if (!nearbyNode) {
          actions.addNode(pos.x, pos.y)
        }
        break
      case "pin-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "pin")
        break
      case "roller-support":
        if (nearbyNode) actions.addSupport(nearbyNode.id, "roller")
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-grow cursor-crosshair rounded-lg border border-stone-200 bg-stone-50 shadow-inner"
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Desenha os Nós */}
          {nodes.map((node) => (
            <Circle
              key={node.id}
              x={node.x}
              y={node.y}
              radius={6}
              fill="black"
            />
          ))}

          {/* Desenha os Apoios */}
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
                    // Desenho do Apoio Fixo
                    context.moveTo(-10, 10)
                    context.lineTo(0, 0)
                    context.lineTo(10, 10)
                    context.closePath()
                  } else if (support.type === "roller") {
                    // Desenho do Apoio Móvel
                    context.moveTo(-10, 10)
                    context.lineTo(0, 0)
                    context.lineTo(10, 10)
                    context.closePath()
                    context.moveTo(-12, 12)
                    context.lineTo(12, 12) // Base
                    context.moveTo(-7, 14)
                    context.arc(-5, 14, 2, 0, Math.PI * 2, false) // Roda 1
                    context.moveTo(7, 14)
                    context.arc(5, 14, 2, 0, Math.PI * 2, false) // Roda 2
                  }
                  context.fillStrokeShape(shape)
                }}
                fill="#34d399" // Verde-água
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

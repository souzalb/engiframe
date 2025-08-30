"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Pin,
  RollerCoaster,
  Plus,
  ArrowDownToLine,
  Waves,
  Minus,
} from "lucide-react"
import { useAppStore } from "../lib/store"

type Tool =
  | "node"
  | "member"
  | "pin-support"
  | "roller-support"
  | "point-load"
  | "dist-load"

export default function Toolbar() {
  const { activeTool, actions } = useAppStore()

  const handleToolClick = (tool: Tool) => {
    actions.setActiveTool(activeTool === tool ? null : tool)
  }

  return (
    <aside className="w-72 overflow-y-auto border-r bg-white p-6 shadow-lg">
      <h2 className="border-b pb-2 text-lg font-semibold">
        Ferramentas de Modelagem
      </h2>

      <TooltipProvider delayDuration={100}>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              1. Desenhar Viga
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === "node" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("node")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Nó
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adiciona um nó na estrutura</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              1.1 Adicionar Barra
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === "member" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("member")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adiciona um nó na estrutura</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              2. Adicionar Apoios
            </h3>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      activeTool === "pin-support" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handleToolClick("pin-support")}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Apoio Fixo (2º Gênero)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      activeTool === "roller-support" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handleToolClick("roller-support")}
                  >
                    <RollerCoaster className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Apoio Móvel (1º Gênero)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              3. Aplicar Cargas
            </h3>
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="point-load-value">Força Pontual (kN)</Label>
                <Input type="number" id="point-load-value" defaultValue={-10} />
                <Button
                  variant={activeTool === "point-load" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToolClick("point-load")}
                >
                  <ArrowDownToLine className="mr-2 h-4 w-4" /> Aplicar Força
                </Button>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="dist-load-value">Carga Dist. (kN/m)</Label>
                <Input type="number" id="dist-load-value" defaultValue={-5} />
                <Button
                  variant={activeTool === "dist-load" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToolClick("dist-load")}
                >
                  <Waves className="mr-2 h-4 w-4" /> Aplicar Carga
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </aside>
  )
}

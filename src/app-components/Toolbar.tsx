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
  Minus,
  Trash2,
  Calculator,
  GripVertical,
  RotateCw,
} from "lucide-react"
import { useAppStore, Tool } from "@/lib/store"

export default function Toolbar() {
  const activeTool = useAppStore((state) => state.activeTool)
  const currentFy = useAppStore((state) => state.currentFy)
  const currentMz = useAppStore((state) => state.currentMz)
  const actions = useAppStore((state) => state.actions)

  const handleToolClick = (tool: Tool) => {
    actions.setActiveTool(activeTool === tool ? null : tool)
  }

  return (
    <aside className="flex w-72 flex-col overflow-y-auto border-r bg-white p-6 shadow-lg">
      <h2 className="border-b pb-2 text-lg font-semibold">
        Ferramentas de Modelagem
      </h2>
      <TooltipProvider delayDuration={100}>
        <div className="mt-4 flex-grow space-y-6">
          {/* ... Seção 1: Desenhar Estrutura ... */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              1. Desenhar Estrutura
            </h3>
            <div className="flex gap-2">
              <TooltipWrapper content="Adicionar Nó">
                <Button
                  variant={activeTool === "node" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("node")}
                >
                  {" "}
                  <Plus className="h-4 w-4" />{" "}
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content="Adicionar Barra">
                <Button
                  variant={activeTool === "member" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("member")}
                >
                  {" "}
                  <Minus className="h-4 w-4" />{" "}
                </Button>
              </TooltipWrapper>
            </div>
          </div>
          <Separator />

          {/* Seção 2: Adicionar Apoios */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              2. Adicionar Apoios
            </h3>
            <div className="flex gap-2">
              <TooltipWrapper content="Apoio Fixo (2º Gênero)">
                <Button
                  variant={activeTool === "pin-support" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleToolClick("pin-support")}
                >
                  {" "}
                  <Pin className="h-4 w-4" />{" "}
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content="Apoio Móvel (1º Gênero)">
                <Button
                  variant={
                    activeTool === "roller-support" ? "default" : "outline"
                  }
                  size="icon"
                  onClick={() => handleToolClick("roller-support")}
                >
                  {" "}
                  <RollerCoaster className="h-4 w-4" />{" "}
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content="Engaste (3º Gênero)">
                <Button
                  variant={
                    activeTool === "fixed-support" ? "default" : "outline"
                  }
                  size="icon"
                  onClick={() => handleToolClick("fixed-support")}
                >
                  {" "}
                  <GripVertical className="h-4 w-4" />{" "}
                </Button>
              </TooltipWrapper>
            </div>
          </div>
          <Separator />

          {/* Seção 3: Aplicar Cargas */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              3. Aplicar Cargas
            </h3>
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="point-load-value">Força Pontual Y (kN)</Label>
                <Input
                  type="number"
                  id="point-load-value"
                  value={currentFy}
                  onChange={(e) =>
                    actions.setCurrentFy(parseFloat(e.target.value) || 0)
                  }
                />
                <Button
                  variant={activeTool === "point-load" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToolClick("point-load")}
                >
                  {" "}
                  <ArrowDownToLine className="mr-2 h-4 w-4" /> Aplicar
                  Força{" "}
                </Button>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="moment-load-value">Momento (kN·m)</Label>
                <Input
                  type="number"
                  id="moment-load-value"
                  value={currentMz}
                  onChange={(e) =>
                    actions.setCurrentMz(parseFloat(e.target.value) || 0)
                  }
                />
                <Button
                  variant={activeTool === "moment-load" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToolClick("moment-load")}
                >
                  {" "}
                  <RotateCw className="mr-2 h-4 w-4" /> Aplicar Momento{" "}
                </Button>
              </div>
            </div>
          </div>
          <Separator />

          {/* Seção 4: Análise */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-700">
              4. Análise
            </h3>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              onClick={actions.calculate}
            >
              {" "}
              <Calculator className="mr-2 h-4 w-4" /> Calcular{" "}
            </Button>
          </div>
        </div>

        {/* Botão de Limpar */}
        <div className="mt-auto border-t pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={actions.reset}
          >
            {" "}
            <Trash2 className="mr-2 h-4 w-4" /> Limpar Tudo{" "}
          </Button>
        </div>
      </TooltipProvider>
    </aside>
  )
}

const TooltipWrapper = ({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
)

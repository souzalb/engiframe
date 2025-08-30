import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

// Tipos de Ferramentas
export type Tool =
  | "select"
  | "node"
  | "member"
  | "pin-support"
  | "roller-support"
  | "fixed-support"
  | "point-load"
  | "dist-load"
  | null

// Tipos de Dados da Estrutura
export interface Node {
  id: string
  x: number
  y: number
}

export interface Support {
  id: string
  nodeId: string
  type: "pin" | "roller" | "fixed"
}

// Futuramente adicionaremos: Member, PointLoad, etc.

// Estrutura do Estado Global da Aplicação
interface AppState {
  activeTool: Tool
  nodes: Node[]
  supports: Support[]

  // Agrupamos todas as funções que modificam o estado em 'actions'
  actions: {
    setActiveTool: (tool: Tool) => void
    addNode: (x: number, y: number) => void
    addSupport: (nodeId: string, type: "pin" | "roller" | "fixed") => void
    findNodeNear: (x: number, y: number, tolerance?: number) => Node | null
    reset: () => void
  }
}

// Estado inicial da aplicação
const initialState = {
  activeTool: null,
  nodes: [],
  supports: [],
}

// Criação do store com Zustand
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  actions: {
    setActiveTool: (tool) => set({ activeTool: tool }),

    addNode: (x, y) => {
      const newNode: Node = { id: uuidv4(), x, y }
      set((state) => ({ nodes: [...state.nodes, newNode] }))
    },

    addSupport: (nodeId, type) => {
      // Evita adicionar múltiplos apoios no mesmo nó
      if (get().supports.some((s) => s.nodeId === nodeId)) return
      const newSupport: Support = { id: uuidv4(), nodeId, type }
      set((state) => ({ supports: [...state.supports, newSupport] }))
    },

    findNodeNear: (x, y, tolerance = 15) => {
      // Procura por um nó próximo à posição do cursor
      const nodes = get().nodes
      for (const node of nodes) {
        const distance = Math.sqrt(
          Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2),
        )
        if (distance <= tolerance) {
          return node
        }
      }
      return null
    },

    reset: () =>
      set(() => ({
        activeTool: null,
        nodes: [],
        supports: [],
      })),
  },
}))

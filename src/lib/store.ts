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

export interface Member {
  id: string
  startNodeId: string
  endNodeId: string
}

// Estrutura do Estado Global da Aplicação
interface AppState {
  activeTool: Tool
  startNodeForMember: string | null // Armazena o ID do primeiro nó ao criar uma barra
  nodes: Node[]
  supports: Support[]
  members: Member[]

  actions: {
    setActiveTool: (tool: Tool) => void
    setStartNodeForMember: (nodeId: string | null) => void
    addNode: (x: number, y: number) => void
    addSupport: (nodeId: string, type: "pin" | "roller" | "fixed") => void
    addMember: (startNodeId: string, endNodeId: string) => void
    findNodeNear: (x: number, y: number, tolerance?: number) => Node | null
    reset: () => void
  }
}

const initialState = {
  activeTool: null,
  startNodeForMember: null,
  nodes: [],
  supports: [],
  members: [],
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  actions: {
    setActiveTool: (tool) => {
      // Se o utilizador trocar de ferramenta, cancelamos a criação de barra
      set({ activeTool: tool, startNodeForMember: null })
    },

    setStartNodeForMember: (nodeId) => set({ startNodeForMember: nodeId }),

    addNode: (x, y) => {
      const newNode: Node = { id: uuidv4(), x, y }
      set((state) => ({ nodes: [...state.nodes, newNode] }))
    },

    addSupport: (nodeId, type) => {
      if (get().supports.some((s) => s.nodeId === nodeId)) return
      const newSupport: Support = { id: uuidv4(), nodeId, type }
      set((state) => ({ supports: [...state.supports, newSupport] }))
    },

    addMember: (startNodeId, endNodeId) => {
      if (startNodeId === endNodeId) return // Não cria barra no mesmo nó
      const newMember: Member = { id: uuidv4(), startNodeId, endNodeId }
      set((state) => ({ members: [...state.members, newMember] }))
    },

    findNodeNear: (x, y, tolerance = 15) => {
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

    reset: () => set(initialState),
  },
}))

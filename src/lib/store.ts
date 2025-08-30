import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import { solveFrame } from "./solver"
// Vamos importar o novo solver de pórticos

// Tipos de Ferramentas
export type Tool =
  | "select"
  | "node"
  | "member"
  | "pin-support"
  | "roller-support"
  | "fixed-support"
  | "point-load"
  | "moment-load"
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
export interface PointLoad {
  id: string
  nodeId: string
  fx: number
  fy: number
}
export interface MomentLoad {
  id: string
  nodeId: string
  mz: number
}

export interface Reaction {
  id: string
  nodeId: string
  fx: number
  fy: number
  mz: number
}
export interface AnalysisResults {
  reactions: Reaction[]
}

// Estrutura do Estado Global
interface AppState {
  activeTool: Tool
  startNodeForMember: string | null
  currentFx: number
  currentFy: number
  currentMz: number // Novo: Momento
  nodes: Node[]
  supports: Support[]
  members: Member[]
  pointLoads: PointLoad[]
  momentLoads: MomentLoad[] // Novo: Cargas de Momento
  results: AnalysisResults | null

  actions: {
    setActiveTool: (tool: Tool) => void
    setStartNodeForMember: (nodeId: string | null) => void
    setCurrentFx: (fx: number) => void
    setCurrentFy: (fy: number) => void
    setCurrentMz: (mz: number) => void // Novo
    addNode: (x: number, y: number) => void
    addSupport: (nodeId: string, type: "pin" | "roller" | "fixed") => void
    addMember: (startNodeId: string, endNodeId: string) => void
    addPointLoad: (nodeId: string, fx: number, fy: number) => void
    addMomentLoad: (nodeId: string, mz: number) => void // Novo
    findNodeNear: (x: number, y: number, tolerance?: number) => Node | null
    reset: () => void
    calculate: () => void
  }
}

const initialState = {
  activeTool: null,
  startNodeForMember: null,
  currentFx: 0,
  currentFy: -10,
  currentMz: 10, // Novo
  nodes: [],
  supports: [],
  members: [],
  pointLoads: [],
  momentLoads: [], // Novo
  results: null,
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  actions: {
    setActiveTool: (tool) =>
      set({ activeTool: tool, startNodeForMember: null }),
    setStartNodeForMember: (nodeId) => set({ startNodeForMember: nodeId }),
    setCurrentFx: (fx) => set({ currentFx: fx }),
    setCurrentFy: (fy) => set({ currentFy: fy }),
    setCurrentMz: (mz) => set({ currentMz: mz }), // Novo

    addNode: (x, y) =>
      set((state) => ({ nodes: [...state.nodes, { id: uuidv4(), x, y }] })),

    addSupport: (nodeId, type) => {
      if (get().supports.some((s) => s.nodeId === nodeId)) return
      set((state) => ({
        supports: [...state.supports, { id: uuidv4(), nodeId, type }],
      }))
    },

    addMember: (startNodeId, endNodeId) => {
      if (startNodeId === endNodeId) return
      set((state) => ({
        members: [...state.members, { id: uuidv4(), startNodeId, endNodeId }],
      }))
    },

    addPointLoad: (nodeId, fx, fy) => {
      if (get().pointLoads.some((l) => l.nodeId === nodeId)) return
      set((state) => ({
        pointLoads: [...state.pointLoads, { id: uuidv4(), nodeId, fx, fy }],
      }))
    },

    addMomentLoad: (nodeId, mz) => {
      if (get().momentLoads.some((l) => l.nodeId === nodeId)) return
      set((state) => ({
        momentLoads: [...state.momentLoads, { id: uuidv4(), nodeId, mz }],
      }))
    },

    findNodeNear: (x, y, tolerance = 15) => {
      return (
        get().nodes.find(
          (node) =>
            Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) <=
            tolerance,
        ) || null
      )
    },

    reset: () => set(initialState),

    calculate: () => {
      const { nodes, members, supports, pointLoads, momentLoads } = get()
      try {
        const results = solveFrame({
          nodes,
          members,
          supports,
          pointLoads,
          momentLoads,
        })
        set({ results })
      } catch (error) {
        console.error("Erro no cálculo do pórtico:", error)
        alert(
          `Ocorreu um erro durante o cálculo: ${error instanceof Error ? error.message : String(error)}`,
        )
        set({ results: null })
      }
    },
  },
}))

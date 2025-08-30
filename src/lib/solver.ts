import {
  Node,
  Member,
  Support,
  PointLoad,
  MomentLoad,
  AnalysisResults,
} from "./store"
import {
  matrix,
  multiply,
  inv,
  subset,
  index,
  zeros,
  Matrix,
  transpose,
  subtract,
} from "mathjs"

interface StructureData {
  nodes: Node[]
  members: Member[]
  supports: Support[]
  pointLoads: PointLoad[]
  momentLoads: MomentLoad[]
}

export function solveFrame({
  nodes,
  members,
  supports,
  pointLoads,
  momentLoads,
}: StructureData): AnalysisResults {
  const nodeMap = new Map(nodes.map((node, i) => [node.id, i]))
  const numNodes = nodes.length
  const numDof = numNodes * 3 // 3 Graus de Liberdade por nó: Fx, Fy, Mz

  if (numDof === 0) return { reactions: [] }

  const K = zeros(numDof, numDof) as Matrix
  const F = zeros(numDof) as Matrix

  // Propriedades do Material e Seção (Exemplos)
  const E = 210e6 // Módulo de Elasticidade (kPa) - Aço
  const I = 8.33e-6 // Momento de Inércia (m^4) - Exemplo
  const A = 0.01 // Área da seção (m^2) - Exemplo

  // Montar Matriz de Rigidez Global (K)
  members.forEach((member) => {
    const n1 = nodes.find((n) => n.id === member.startNodeId)!
    const n2 = nodes.find((n) => n.id === member.endNodeId)!
    const i = nodeMap.get(n1.id)!
    const j = nodeMap.get(n2.id)!

    const L = Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2))
    if (L === 0) return

    const c = (n2.x - n1.x) / L // cos(theta)
    const s = (n2.y - n1.y) / L // sin(theta)

    // Matriz de rigidez local do elemento de pórtico (6x6)
    const k_local = getLocalStiffnessMatrix(E, A, I, L)
    // Matriz de transformação (6x6)
    const T = getTransformationMatrix(c, s)

    // k_global = T_transpose * k_local * T
    const T_transpose = transpose(T)
    const k_global_member = multiply(multiply(T_transpose, k_local), T)

    const indices = [3 * i, 3 * i + 1, 3 * i + 2, 3 * j, 3 * j + 1, 3 * j + 2]
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const currentVal = K.get([indices[row], indices[col]])
        K.set(
          [indices[row], indices[col]],
          currentVal + (k_global_member.get([row, col]) as number),
        )
      }
    }
  })

  // Montar Vetor de Força Global (F)
  pointLoads.forEach((load) => {
    const nodeIndex = nodeMap.get(load.nodeId)!
    F.set([nodeIndex * 3], F.get([nodeIndex * 3]) + load.fx) // Fx
    F.set([nodeIndex * 3 + 1], F.get([nodeIndex * 3 + 1]) + load.fy) // Fy
  })
  momentLoads.forEach((load) => {
    const nodeIndex = nodeMap.get(load.nodeId)!
    F.set([nodeIndex * 3 + 2], F.get([nodeIndex * 3 + 2]) + load.mz) // Mz
  })

  // Aplicar Condições de Contorno
  const constrainedDof: number[] = []
  supports.forEach((support) => {
    const nodeIndex = nodeMap.get(support.nodeId)!
    const dofX = nodeIndex * 3
    const dofY = nodeIndex * 3 + 1
    const dofZ = nodeIndex * 3 + 2
    if (support.type === "fixed") {
      constrainedDof.push(dofX, dofY, dofZ)
    } else if (support.type === "pin") {
      constrainedDof.push(dofX, dofY)
    } else if (support.type === "roller") {
      constrainedDof.push(dofY) // Assumindo rolete que permite movimento em X
    }
  })

  const freeDof = Array.from(Array(numDof).keys()).filter(
    (dof) => !constrainedDof.includes(dof),
  )
  if (freeDof.length === 0)
    throw new Error("A estrutura está totalmente restringida.")

  // Resolver o sistema: K_ff * U_f = F_f
  const K_ff = subset(K, index(freeDof, freeDof))
  const F_f = subset(F, index(freeDof))

  let U_f: Matrix
  try {
    U_f = multiply(inv(K_ff as Matrix), F_f) as Matrix
  } catch {
    throw new Error(
      "A estrutura é instável (matriz singular). Verifique os apoios.",
    )
  }

  const U = zeros(numDof) as Matrix
  freeDof.forEach((dof, i) => U.set([dof], U_f.get([i, 0])))

  // Calcular Reações: R = K * U - F
  const R = subtract(multiply(K, U), F) as Matrix

  const reactions = supports.map((support) => {
    const nodeIndex = nodeMap.get(support.nodeId)!
    return {
      id: support.id,
      nodeId: support.nodeId,
      fx: -R.get([nodeIndex * 3]),
      fy: -R.get([nodeIndex * 3 + 1]),
      mz: -R.get([nodeIndex * 3 + 2]),
    }
  })

  return { reactions }
}

function getLocalStiffnessMatrix(
  E: number,
  A: number,
  I: number,
  L: number,
): Matrix {
  const EA_L = (E * A) / L
  const EI_L = (E * I) / L
  const EI_L2 = (E * I) / L ** 2
  const EI_L3 = (E * I) / L ** 3
  return matrix([
    [EA_L, 0, 0, -EA_L, 0, 0],
    [0, 12 * EI_L3, 6 * EI_L2, 0, -12 * EI_L3, 6 * EI_L2],
    [0, 6 * EI_L2, 4 * EI_L, 0, -6 * EI_L2, 2 * EI_L],
    [-EA_L, 0, 0, EA_L, 0, 0],
    [0, -12 * EI_L3, -6 * EI_L2, 0, 12 * EI_L3, -6 * EI_L2],
    [0, 6 * EI_L2, 2 * EI_L, 0, -6 * EI_L2, 4 * EI_L],
  ])
}

function getTransformationMatrix(c: number, s: number): Matrix {
  return matrix([
    [c, s, 0, 0, 0, 0],
    [-s, c, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, c, s, 0],
    [0, 0, 0, -s, c, 0],
    [0, 0, 0, 0, 0, 1],
  ])
}

"use client"

import dynamic from "next/dynamic"
import React from "react"

// A importação dinâmica aponta para o arquivo vizinho.
// O comentário /* webpackChunkName: "konva" */ é uma otimização opcional mas boa prática.
const CanvasAreaClient = dynamic(() => import("./CanvasAreaClient"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-grow items-center justify-center rounded-lg border border-stone-200 bg-stone-100 shadow-inner">
      <p className="text-stone-500">Carregando área de desenho...</p>
    </div>
  ),
})

export default function CanvasArea() {
  return <CanvasAreaClient />
}

"use client"

import { Button } from "@/components/ui/button"

import { Calculator, Trash2 } from "lucide-react"
import { useAppStore } from "../lib/store"

export default function Header() {
  const reset = useAppStore((state) => state.actions.reset)

  return (
    <header className="z-10 flex items-center justify-between border-b bg-white p-4 shadow-md">
      <h1 className="text-2xl font-bold text-teal-600">
        EngiFrame{" "}
        <span className="text-sm font-normal text-stone-500">React</span>
      </h1>
      <div className="flex items-center gap-2">
        <Button disabled>
          <Calculator className="mr-2 h-4 w-4" /> Calcular
        </Button>
        <Button variant="destructive" onClick={reset}>
          <Trash2 className="mr-2 h-4 w-4" /> Limpar
        </Button>
      </div>
    </header>
  )
}

import CanvasArea from "@/app-components/CanvasArea"
import Header from "@/app-components/Header"
import ResultsPanel from "@/app-components/ResultsPanel"
import Toolbar from "@/app-components/Toolbar"

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-stone-100 font-sans text-stone-800">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="flex flex-1 flex-col overflow-auto p-4">
          <CanvasArea />
          <ResultsPanel />
        </main>
      </div>
    </div>
  )
}

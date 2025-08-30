import CanvasArea from "./_components/canvas-area";
import Header from "./_components/header";
import ResultsPanel from "./_components/results-panel";
import Toolbar from "./_components/toolbar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-stone-100 text-stone-800 font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="flex-1 flex flex-col p-4 overflow-auto">
          <CanvasArea />
          <ResultsPanel />
        </main>
      </div>
    </div>
  );
}

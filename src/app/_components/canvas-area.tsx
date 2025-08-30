export default function CanvasArea() {
  return (
    <div className="bg-white rounded-lg shadow-inner border border-stone-200 flex-grow">
      {/* O Canvas para desenhar a estrutura irá aqui */}
      <div className="flex items-center justify-center h-full">
        <p className="text-stone-400">Área de Desenho</p>
      </div>
    </div>
  );
}

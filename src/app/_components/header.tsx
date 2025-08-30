export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center z-10 border-b">
      <h1 className="text-2xl font-bold text-teal-600">
        EngiFrame{" "}
        <span className="text-sm font-normal text-stone-500">React</span>
      </h1>
      <div>{/* Botões de Ação irão aqui */}</div>
    </header>
  );
}

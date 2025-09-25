const FullScreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
    <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/10 p-10 text-white shadow-2xl backdrop-blur-lg">
      <div className="relative">
        {/* Moneda girando */}
        <div
          className="h-24 w-24 animate-spin rounded-full border-4 border-white/30 border-t-yellow-300"
          aria-hidden="true"
        />
        {/* Efecto pulso */}
        <div
          className="absolute inset-0 animate-ping rounded-full border border-white/40"
          aria-hidden="true"
        />
        {/* Icono central */}
        <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white/20">
          <span className="text-3xl font-bold text-yellow-300">$</span>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-2xl font-semibold tracking-wide">
          Organizando tus finanzas
        </p>
        <p className="text-sm text-white/80">
          Calculando ingresos, gastos y balances para que tengas todo bajo
          control...
        </p>
      </div>
    </div>
  </div>
);

export default FullScreenLoader;
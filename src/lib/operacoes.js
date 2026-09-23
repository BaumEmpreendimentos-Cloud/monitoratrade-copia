// Cálculos financeiros das operações (Monitora Trade)

export const calcValorInicial = (operacao, quantidade, preco) =>
  (operacao === 'VENDA' ? 1 : -1) * quantidade * preco;

export const calcResultadoValor = (operacao, quantidade, entrada, atual) => {
  if (atual === null || atual === undefined || atual === '') return null;
  return operacao === 'COMPRA'
    ? (atual - entrada) * quantidade
    : (entrada - atual) * quantidade;
};

export const calcResultadoPct = (operacao, entrada, atual) => {
  if (atual === null || atual === undefined || atual === '' || !entrada) return null;
  return operacao === 'COMPRA'
    ? ((atual - entrada) / entrada) * 100
    : ((entrada - atual) / entrada) * 100;
};

export const calcIntrinseco = (categoria, strike, underlying) => {
  if ((categoria !== 'CALL' && categoria !== 'PUT') || strike == null || underlying == null || underlying === '') return null;
  const s = Number(strike); const u = Number(underlying);
  if (Number.isNaN(s) || Number.isNaN(u)) return null;
  return categoria === 'CALL' ? Math.max(0, u - s) : Math.max(0, s - u);
};

export const calcExtrinseco = (categoria, strike, optionPremium, underlying) => {
  if (optionPremium == null || optionPremium === '') return null;
  const intr = calcIntrinseco(categoria, strike, underlying);
  if (intr == null) return null;
  return Number(optionPremium) - intr;
};

export const businessDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const end = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(end.getTime())) return null;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  if (end < start) return 0;
  let count = 0; const cur = new Date(start);
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};

export const calcMoneyness = (categoria, strike, underlying, tolerance = 0.02) => {
  if ((categoria !== 'CALL' && categoria !== 'PUT') || strike == null || underlying == null || underlying === '') return null;
  const s = Number(strike); const u = Number(underlying);
  if (Number.isNaN(s) || Number.isNaN(u)) return null;
  const diff = Math.abs(u - s) / s;
  if (diff <= tolerance) return 'ATM';
  if (categoria === 'CALL') return u > s ? 'ITM' : 'OTM';
  return u < s ? 'ITM' : 'OTM';
};

export const moneynessRowClass = (categoria, strike, underlying) => {
  const m = calcMoneyness(categoria, strike, underlying);
  if (m === 'ITM' || m === 'ATM') return 'bg-red-50/70 hover:bg-red-100/70 dark:bg-red-950/30';
  if (m === 'OTM') return 'bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/30';
  return '';
};

export const calcResultadoOpcaoUnderlying = (categoria, operacao, strike, precoEntrada, quantidade, underlying) => {
  if (underlying == null || underlying === '' || strike == null) return null;
  const u = Number(underlying); const s = Number(strike);
  if (Number.isNaN(u) || Number.isNaN(s)) return null;
  const intr = categoria === 'CALL' ? Math.max(0, u - s) : Math.max(0, s - u);
  return operacao === 'COMPRA' ? (intr - precoEntrada) * quantidade : (precoEntrada - intr) * quantidade;
};
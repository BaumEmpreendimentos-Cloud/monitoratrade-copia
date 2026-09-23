// Apuração de Imposto de Renda sobre operações de renda variável (Monitora Trade)

export const CATEGORIAS_FISCAIS = {
  ACOES: { label: 'Ações', aliquota: 0.15, aliquotaDayTrade: 0.20, isencaoLimite: 20000 },
  OPCOES: { label: 'Opções', aliquota: 0.15, aliquotaDayTrade: 0.20, isencaoLimite: 0 },
  FII: { label: 'FIIs', aliquota: 0.15, aliquotaDayTrade: 0.20, isencaoLimite: 0 },
  FUTUROS: { label: 'Futuros', aliquota: 0.15, aliquotaDayTrade: 0.20, isencaoLimite: 0 },
};

export const categoriaFiscal = (categoria) => {
  switch (categoria) {
    case 'ACAO': return 'ACOES';
    case 'CALL':
    case 'PUT': return 'OPCOES';
    case 'FII': return 'FII';
    case 'DOLLAR': return 'FUTUROS';
    default: return null;
  }
};

export const isDayTradeOp = (op) => {
  if (!op.data_abertura || !op.data_fechamento) return false;
  const dAbertura = new Date(op.data_abertura + 'T00:00:00');
  const dFechamento = new Date(op.data_fechamento);
  if (Number.isNaN(dAbertura.getTime()) || Number.isNaN(dFechamento.getTime())) return false;
  return dAbertura.toDateString() === dFechamento.toDateString();
};

export const mesChave = (dataStr) => {
  if (!dataStr) return null;
  const d = new Date(dataStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const mesLabel = (chave) => {
  if (!chave) return '';
  const [ano, mes] = chave.split('-');
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${nomes[parseInt(mes, 10) - 1]}/${ano}`;
};

const ALIQUOTA_SWING = 0.15;
const ALIQUOTA_DT = 0.20;

export const apurarImpostoRenda = (operacoes, config) => {
  if (!operacoes || !config || !config.mes_inicio) return [];

  const mesInicio = config.mes_inicio;

  const fechadas = operacoes.filter((o) =>
    o.status === 'FECHADA' && o.data_fechamento && mesChave(o.data_fechamento) && mesChave(o.data_fechamento) >= mesInicio
  );

  const meses = {};
  fechadas.forEach((op) => {
    const chave = mesChave(op.data_fechamento);
    if (!chave) return;
    if (!meses[chave]) meses[chave] = [];
    meses[chave].push(op);
  });

  const chavesMes = Object.keys(meses).sort();

  let prejuizoSwing = Math.abs(Number(config.prejuizo_swing || 0));
  let prejuizoDt = Math.abs(Number(config.prejuizo_dt || 0));

  const resultados = [];

  chavesMes.forEach((chave) => {
    const opsDoMes = meses[chave];

    ['swing', 'dayTrade'].forEach((tipo) => {
      const opsTipo = opsDoMes.filter((o) =>
        tipo === 'dayTrade' ? isDayTradeOp(o) : !isDayTradeOp(o)
      );
      if (!opsTipo.length) return;

      const breakdown = {};
      opsTipo.forEach((o) => {
        const cat = categoriaFiscal(o.categoria);
        if (cat) {
          breakdown[cat] = (breakdown[cat] || 0) + (Number(o.resultado_valor) || 0);
        }
      });

      const resultadoBruto = opsTipo.reduce((s, o) => s + (Number(o.resultado_valor) || 0), 0);
      const irrf = opsTipo.reduce((s, o) => s + (Number(o.irrf) || 0), 0);
      const aliquota = tipo === 'dayTrade' ? ALIQUOTA_DT : ALIQUOTA_SWING;

      const prejuizoAnterior = tipo === 'dayTrade' ? prejuizoDt : prejuizoSwing;

      let prejuizoCompensado = 0;
      let baseCalculo = resultadoBruto;
      if (resultadoBruto > 0) {
        prejuizoCompensado = Math.min(prejuizoAnterior, resultadoBruto);
        baseCalculo = resultadoBruto - prejuizoCompensado;
      }

      const impostoDevido = baseCalculo > 0 ? baseCalculo * aliquota : 0;
      const impostoAPagar = Math.max(0, impostoDevido - irrf);

      if (resultadoBruto < 0) {
        if (tipo === 'dayTrade') prejuizoDt += Math.abs(resultadoBruto);
        else prejuizoSwing += Math.abs(resultadoBruto);
      } else if (prejuizoCompensado > 0) {
        if (tipo === 'dayTrade') prejuizoDt = Math.max(0, prejuizoDt - prejuizoCompensado);
        else prejuizoSwing = Math.max(0, prejuizoSwing - prejuizoCompensado);
      }

      const prejuizoAcumuladoFinal = tipo === 'dayTrade' ? prejuizoDt : prejuizoSwing;
      const saldoFinal = baseCalculo > 0 ? baseCalculo : -prejuizoAcumuladoFinal;

      resultados.push({
        mes: chave,
        tipo: tipo === 'dayTrade' ? 'Day Trade' : 'Swing Trade',
        tipoKey: tipo === 'dayTrade' ? 'DAY_TRADE' : 'SWING',
        operacoes: opsTipo,
        totalOperacoes: opsTipo.length,
        breakdown,
        resultadoBruto,
        irrf,
        prejuizoAnterior,
        prejuizoCompensado,
        prejuizoAcumuladoFinal,
        saldoFinal,
        aliquota,
        impostoDevido,
        impostoAPagar,
      });
    });
  });

  return resultados;
};
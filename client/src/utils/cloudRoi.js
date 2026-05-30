/** Costos anuales de referencia vs nodo ProxDeep (misma base en dashboard y propuesta). */
export function buildCloudRoiComparison(users, proxdeepAnnualUsd) {
  const gpusNeeded = Math.max(1, Math.ceil(users / 50));
  const proxdeepAnnual = parseFloat(proxdeepAnnualUsd) || 0;

  const competitors = [
    { label: 'AWS On-Demand (g5.xlarge)', sublabel: `${gpusNeeded}x NVIDIA A10G — $1.006/hr`, annual: Math.round(gpusNeeded * 1.006 * 8760) },
    { label: 'AWS Reserved 1 año (g5.xlarge)', sublabel: `${gpusNeeded}x NVIDIA A10G — $0.60/hr`, annual: Math.round(gpusNeeded * 0.60 * 8760) },
    { label: 'Azure NC T4 v3 (on-demand)', sublabel: `${gpusNeeded}x Tesla T4 — $0.752/hr`, annual: Math.round(gpusNeeded * 0.752 * 8760) },
    { label: 'Azure A100 v4 (on-demand)', sublabel: `${Math.ceil(gpusNeeded / 2)}x NVIDIA A100 — $3.67/hr`, annual: Math.round(Math.ceil(gpusNeeded / 2) * 3.67 * 8760) },
    { label: 'OpenAI API (GPT-4o)', sublabel: '500K tokens/usuario/mes × $15/1M tokens', annual: Math.round(users * 500_000 * 12 * (15 / 1_000_000)) },
  ];

  const proxdeep = {
    label: 'ProxDeep Nodo Soberano',
    sublabel: `Tarifa fija anual — ${gpusNeeded} GPU(s) + plataforma + SMLs + soporte`,
    annual: proxdeepAnnual,
    highlight: true,
  };

  const bestCloudAlternative = Math.min(...competitors.map(c => c.annual));
  const savingsVsBestCloud = bestCloudAlternative > proxdeepAnnual
    ? Math.round(((bestCloudAlternative - proxdeepAnnual) / bestCloudAlternative) * 100)
    : 0;
  const annualSavingsUSD = Math.max(0, bestCloudAlternative - proxdeepAnnual);
  const openaiAnnual = competitors.find(c => c.label.startsWith('OpenAI'))?.annual || 0;
  const savingsVsOpenAI = openaiAnnual > proxdeepAnnual
    ? Math.round(((openaiAnnual - proxdeepAnnual) / openaiAnnual) * 100)
    : 0;

  // Competidores primero (mayor costo arriba); ProxDeep al final como opción más económica
  const chartItems = [
    ...competitors.sort((a, b) => b.annual - a.annual),
    proxdeep,
  ];
  const maxVal = Math.max(...chartItems.map(i => i.annual), 1);

  return {
    gpusNeeded,
    proxdeepAnnual,
    chartItems,
    maxVal,
    bestCloudAlternative,
    savingsVsBestCloud,
    savingsVsOpenAI,
    annualSavingsUSD,
    openaiAnnual,
  };
}

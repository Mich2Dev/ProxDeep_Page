import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, Check, AlertCircle, Send,
  Edit2, Shield, Lock,
} from 'lucide-react';
import {
  createInitialState,
  toLegacyAnswers,
  selectInfraestructuraFromUi,
  selectFocoFromUi,
  selectStackFromUi,
  selectMadurezFromUi,
  selectEscalaFromUi,
  selectGobernanzaFromUi,
  resetAfterStep,
  isStepComplete,
  canShowRecommendation,
  detectConflicts,
  calculateConfidence,
  buildRecommendation,
  buildFinancialScenario,
  buildAssumptionsAndGaps,
  buildPayloadFromState,
  getOutputStatus,
  WIZARD_UI_CATALOG,
  WIZARD_FORM_SECTIONS,
  STEP_LABELS,
  getStepAccordionMeta,
  formatLegacyStepSummary,
  getStep2OutputLabel,
  getSensitivityLabel,
} from '../domain/wizardDiagnostic';
import {
  resolveDiagnosticInference,
  DIAGNOSTIC_REPORT_BODY_SECTIONS,
} from '../domain/wizardDiagnosticInference';

const CONFIDENCE_CFG = {
  low:    { label: 'Confianza baja',   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',       dot: 'bg-red-400'     },
  medium: { label: 'Confianza media',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   dot: 'bg-amber-400'   },
  high:   { label: 'Confianza alta',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
};

const OUTPUT_STATUS_CFG = {
  exploratory: {
    label:  'Recomendación exploratoria',
    color:  'text-slate-400',
    border: 'border-slate-700',
    note:   'Faltan datos o existen conflictos sin resolver. La recomendación es orientativa y no está lista para propuesta.',
  },
  preliminary: {
    label:  'Recomendación preliminar validable',
    color:  'text-amber-400',
    border: 'border-amber-500/40',
    note:   'La recomendación es preliminar. Puede validarse con el equipo técnico antes de formalizar.',
  },
  ready: {
    label:  'Lista para propuesta comercial',
    color:  'text-emerald-400',
    border: 'border-emerald-500/40',
    note:   null,
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ClientWizard = () => {
  const { fetchWithAuth, API_URL } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep]             = useState(1);
  const [maxVisibleStep, setMaxVisibleStep]     = useState(1);
  const [showOutput, setShowOutput]               = useState(false);
  const [diagnostic, setDiagnostic]             = useState(createInitialState);
  const answers = useMemo(() => toLegacyAnswers(diagnostic), [diagnostic]);
  const [editingFromOutput, setEditingFromOutput] = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const [submitError, setSubmitError]           = useState(null);
  const [submitted, setSubmitted]               = useState(false);

  // Derived
  const conflicts       = useMemo(() => detectConflicts(diagnostic), [diagnostic]);
  const confidence      = useMemo(
    () => calculateConfidence(diagnostic, conflicts, maxVisibleStep),
    [diagnostic, conflicts, maxVisibleStep],
  );
  const recommendation  = useMemo(() => buildRecommendation(diagnostic), [diagnostic]);
  const financial       = useMemo(() => buildFinancialScenario(diagnostic), [diagnostic]);
  const outputStatus    = useMemo(() => getOutputStatus(confidence, conflicts), [confidence, conflicts]);
  const assumptionsGaps = useMemo(
    () => buildAssumptionsAndGaps(diagnostic, conflicts, showOutput),
    [diagnostic, conflicts, showOutput],
  );
  const showRecommendation = useMemo(() => canShowRecommendation(diagnostic), [diagnostic]);
  const diagnosticInference = useMemo(() => resolveDiagnosticInference(diagnostic), [diagnostic]);

  const advanceToStep = useCallback((step) => {
    setActiveStep(step);
    setMaxVisibleStep(prev => Math.max(prev, step));
  }, []);

  const openStep = useCallback((step) => {
    setDiagnostic(prev => resetAfterStep(prev, step));
    setActiveStep(step);
    setMaxVisibleStep(step);
    setShowOutput(false);
  }, []);

  const selectInfraMode = useCallback((id) => {
    setDiagnostic(prev => selectInfraestructuraFromUi(prev, id));
    advanceToStep(2);
    setShowOutput(false);
    setEditingFromOutput(null);
  }, [advanceToStep]);

  const selectScopeFocus = useCallback((id) => {
    setDiagnostic(prev => selectFocoFromUi(prev, id));
    advanceToStep(3);
  }, [advanceToStep]);

  const selectStackComplexity = useCallback((id) => {
    setDiagnostic(prev => selectStackFromUi(prev, id));
    advanceToStep(3);
  }, [advanceToStep]);

  const selectDataMaturity = useCallback((id) => {
    setDiagnostic(prev => selectMadurezFromUi(prev, id));
    advanceToStep(4);
  }, [advanceToStep]);

  const selectScaleEnvironment = useCallback((id) => {
    setDiagnostic(prev => selectEscalaFromUi(prev, id));
    advanceToStep(5);
  }, [advanceToStep]);

  const selectSecurity = useCallback((id) => {
    setDiagnostic(prev => selectGobernanzaFromUi(prev, id));
  }, []);

  const goToOutput = () => {
    if (editingFromOutput !== null) setEditingFromOutput(null);
    setShowOutput(true);
  };

  const cancelEditing = () => {
    setEditingFromOutput(null);
    setShowOutput(true);
  };

  const editStep = (section) => {
    setEditingFromOutput(section);
    openStep(section);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = buildPayloadFromState(diagnostic, recommendation);

    try {
      const res = await fetchWithAuth(`${API_URL}/client-needs`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar el diagnóstico.');
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-6" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Diagnóstico de Infraestructura de IA</h1>
        <p className="text-sm text-slate-400 mt-1">
          Responde las preguntas a continuación. El sistema construye una recomendación de arquitectura en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* LEFT ─────────────────────────────────────────────────────────── */}
        <div className="min-w-0">

          {/* Step progress */}
          {!showOutput && (
            <div className="flex items-center gap-1 mb-5" aria-label="Progreso del diagnóstico">
              {Array.from({ length: WIZARD_FORM_SECTIONS }).map((_, i) => {
                const s = i + 1;
                const done = s < activeStep || (s <= maxVisibleStep && isStepComplete(s, diagnostic));
                const active = s === activeStep;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all
                      ${done && !active ? 'bg-[#06b6d4] border-[#06b6d4] text-white' :
                        active ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10 ring-2 ring-[#06b6d4]/20' :
                        s <= maxVisibleStep ? 'border-slate-600 text-slate-500' :
                                 'border-slate-700 text-slate-600'}`}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done && !active ? <Check className="w-3.5 h-3.5" /> : s}
                    </div>
                    {i < WIZARD_FORM_SECTIONS - 1 && (
                      <div className={`flex-1 h-px ${done ? 'bg-[#06b6d4]/60' : 'bg-slate-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Editing badge */}
          {editingFromOutput !== null && (
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <Edit2 className="h-3.5 w-3.5 shrink-0" />
              Editando: <span className="font-medium">{getStepAccordionMeta(editingFromOutput, diagnostic).label}</span>
              <span className="text-amber-500">— el resto de tus respuestas se conservan.</span>
              <button
                type="button"
                onClick={cancelEditing}
                className="ml-auto text-amber-300 hover:text-white underline underline-offset-2"
              >
                Volver al resultado
              </button>
            </div>
          )}

          {!showOutput ? (
            <div
              className="bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
              role="presentation"
            >
              {[1, 2, 3, 4, 5].map(stepNum => {
                if (stepNum > maxVisibleStep) return null;
                const cfg = getStepAccordionMeta(stepNum, diagnostic);
                const isActive = activeStep === stepNum;
                const isCollapsed = !isActive && isStepComplete(stepNum, diagnostic);

                return (
                  <WizardAccordionStep
                    key={stepNum}
                    step={stepNum}
                    label={cfg.label}
                    heading={cfg.heading}
                    description={cfg.description}
                    summary={formatLegacyStepSummary(stepNum, answers)}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    onOpen={() => openStep(stepNum)}
                  >
                    {stepNum === 1 && (
                      <div
                        role="radiogroup"
                        aria-label="Infraestructura base"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {WIZARD_UI_CATALOG.infra.map(opt => (
                          <IntentCard
                            key={opt.id}
                            option={opt}
                            selected={answers.infraMode === opt.id}
                            dimmed={false}
                            onSelect={selectInfraMode}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 2 && diagnostic.phase === 'desde_cero' && (
                      <div className="grid grid-cols-1 gap-3">
                        {WIZARD_UI_CATALOG.foco.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.scopeFocus === opt.id}
                            onSelect={selectScopeFocus}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 2 && diagnostic.phase === 'sistemas_existentes' && (
                      <div className="grid grid-cols-1 gap-3">
                        {WIZARD_UI_CATALOG.stack.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.stackComplexity === opt.id}
                            onSelect={selectStackComplexity}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 3 && (
                      <div className="grid grid-cols-1 gap-3">
                        {WIZARD_UI_CATALOG.madurez.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.dataMaturity === opt.id}
                            onSelect={selectDataMaturity}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 4 && (
                      <div className="grid grid-cols-1 gap-3">
                        {WIZARD_UI_CATALOG.escala.map(opt => (
                          <WizardOptionButton
                            key={opt.id}
                            option={opt}
                            selected={answers.scaleEnvironment === opt.id}
                            onSelect={selectScaleEnvironment}
                          />
                        ))}
                      </div>
                    )}

                    {stepNum === 5 && (
                      <div className="space-y-3">
                        {WIZARD_UI_CATALOG.gobernanza.map(opt => {
                          const selected = answers.governanceLevel === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => selectSecurity(opt.id)}
                              className={`w-full text-left p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                                ${selected
                                  ? opt.exceptional
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : 'border-[#06b6d4] bg-[#06b6d4]/10'
                                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {opt.exceptional && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                        Enterprise
                                      </span>
                                    )}
                                    <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-200'}`}>
                                      {opt.label}
                                    </p>
                                  </div>
                                  <p className="text-xs text-slate-500">{opt.description}</p>
                                  <p className={`text-[11px] mt-2 font-medium ${selected ? 'text-cyan-400/90' : 'text-slate-600'}`}>
                                    {opt.summaryBadge}
                                  </p>
                                </div>
                                {opt.exceptional
                                  ? <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                  : <Shield className="h-4 w-4 text-[#06b6d4] shrink-0 mt-0.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </WizardAccordionStep>
                );
              })}

              {showRecommendation && activeStep === 5 && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={goToOutput}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] text-white font-medium text-sm hover:bg-[#0ea5e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all"
                  >
                    {editingFromOutput !== null ? 'Aplicar cambio y ver recomendación' : 'Ver recomendación'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <OutputPanel
              diagnostic={diagnostic}
              answers={answers}
              inference={diagnosticInference}
              recommendation={recommendation}
              financial={financial}
              outputStatus={outputStatus}
              conflicts={conflicts}
              confidence={confidence}
              assumptionsGaps={assumptionsGaps}
              onEditStep={editStep}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitted={submitted}
              submitError={submitError}
              onDashboard={() => navigate('/dashboard')}
            />
          )}

        </div>

        {/* RIGHT: Reasoning Panel ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <ReasoningPanel
            answers={answers}
            recommendation={recommendation}
            conflicts={conflicts}
            confidence={confidence}
            showOutput={showOutput}
            assumptionsGaps={assumptionsGaps}
          />
        </div>

      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const INTENT_ACCENT = {
  cyan: {
    active: 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-400/25',
    focus: 'focus-visible:ring-cyan-400',
    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  violet: {
    active: 'border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-2 ring-violet-400/25',
    focus: 'focus-visible:ring-violet-400',
    badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
};

const WizardAccordionStep = ({
  step, label, heading, description, summary,
  isActive, isCollapsed, onOpen, children,
}) => {
  const headerId = `wizard-header-${step}`;
  const panelId = `wizard-panel-${step}`;
  const contentRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (!isActive || !contentRef.current) return undefined;
    const node = contentRef.current;
    const update = () => setPanelHeight(node.scrollHeight);
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(node);
    return () => ro?.disconnect();
  }, [isActive, children]);

  const handleHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  if (isCollapsed) {
    return (
      <div className="border-b border-slate-800/50 last:border-b-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={false}
          aria-controls={panelId}
          onClick={onOpen}
          onKeyDown={handleHeaderKeyDown}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-left bg-slate-900/30 hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/70"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm text-slate-300 font-medium truncate mt-0.5">{summary}</p>
          </div>
          <Edit2 className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (!isActive) return null;

  return (
    <div className="border-b border-slate-800/50 last:border-b-0 bg-slate-900/50 ring-1 ring-inset ring-cyan-500/10">
      <div
        id={headerId}
        className="px-5 pt-5 pb-1"
        aria-expanded={true}
        aria-controls={panelId}
      >
        <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          Paso {step} · Activo
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white mt-3 tracking-tight">{heading}</h3>
        <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">{description}</p>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out motion-reduce:transition-none"
        style={{
          maxHeight: panelHeight ? panelHeight + 32 : 0,
          opacity: panelHeight ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-5 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
};

const WizardOptionButton = ({ option, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={`w-full text-left p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
      ${selected
        ? 'border-[#06b6d4] bg-[#06b6d4]/10'
        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}
  >
    <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-200'}`}>{option.label}</p>
    <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
    <p className={`text-[11px] mt-2 font-medium ${selected ? 'text-cyan-400/90' : 'text-slate-600'}`}>
      {option.summaryBadge}
    </p>
  </button>
);

const IntentCard = ({ option, selected, dimmed, onSelect }) => {
  const styles = INTENT_ACCENT[option.accent];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.id)}
      className={`
        group text-left p-6 sm:p-7 rounded-2xl border transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${styles.focus}
        ${selected ? styles.active : 'border-slate-700/80 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800/60'}
        ${dimmed ? 'opacity-40' : 'opacity-100'}
      `}
    >
      <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full mb-3 ${styles.badge}`}>
        Paso 1
      </span>
      <p className={`text-lg font-bold ${selected ? 'text-white' : 'text-slate-100 group-hover:text-white'}`}>
        {option.label}
      </p>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{option.description}</p>
      <p className={`text-[11px] mt-3 font-medium ${selected ? (option.accent === 'cyan' ? 'text-cyan-400/90' : 'text-violet-400/90') : 'text-slate-600'}`}>
        {option.summaryBadge}
      </p>
    </button>
  );
};

const ReasoningPanel = ({ answers, recommendation, conflicts, confidence, showOutput, assumptionsGaps }) => {
  const cfg = CONFIDENCE_CFG[confidence];
  const hasAny = !!answers.infraMode || !!answers.scopeFocus || !!answers.stackComplexity
    || !!answers.dataMaturity || !!answers.scaleEnvironment || !!answers.governanceLevel;

  return (
    <div className="bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-5 space-y-5 sticky top-4">
      <div>
        <h3 className="text-sm font-bold text-white">Panel de razonamiento</h3>
        <p className="text-xs text-slate-600 mt-0.5">Explica qué entiende el sistema y por qué recomienda lo que recomienda.</p>
      </div>

      {/* D. Señal de confianza */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">D. Señal de confianza del diagnóstico</p>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
          {confidence === 'low' && 'Menos de 4 pasos respondidos o conflictos sin resolver.'}
          {confidence === 'medium' && 'Respuestas parciales, supuestos abiertos o coherencia parcial.'}
          {confidence === 'high' && 'Todos los pasos respondidos, sin conflictos activos y supuestos mínimos.'}
        </p>
      </div>

      {/* A. Perfil inferido */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">A. Perfil inferido</p>
        {hasAny && recommendation.inferredProfile ? (
          <p className="text-xs text-slate-300 leading-relaxed italic">{recommendation.inferredProfile}</p>
        ) : (
          <p className="text-xs text-slate-600">Responde las preguntas para construir un perfil de caso de uso.</p>
        )}
      </div>

      {/* B. Por qué cambió la recomendación */}
      {(recommendation.changeReasons.length > 0 || recommendation.simplificationHint) && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">B. Por qué cambió la recomendación</p>
          <ul className="space-y-1.5">
            {recommendation.changeReasons.map((reason, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                <span className="text-[#06b6d4] shrink-0">→</span>
                {reason}
              </li>
            ))}
          </ul>
          {recommendation.simplificationHint && (
            <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-800 pt-2">
              Para simplificar o reducir costo: {recommendation.simplificationHint}
            </p>
          )}
        </div>
      )}

      {/* C. Contradicciones detectadas */}
      {conflicts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">C. Contradicciones detectadas</p>
          {conflicts.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded-lg border text-xs
                ${c.severity === 'high'
                  ? 'border-red-500/40 bg-red-500/10'
                  : 'border-amber-500/30 bg-amber-500/10'}`}
            >
              <p className={`font-semibold mb-1 ${c.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                Conflicto {c.id}: {c.title}
              </p>
              <p className="text-slate-300 mb-1">{c.message}</p>
              <p className="text-slate-500 italic">{c.suggestion}</p>
            </div>
          ))}
          <p className="text-[11px] text-amber-500/80">La recomendación queda condicionada hasta resolver estos conflictos.</p>
        </div>
      ) : hasAny && !showOutput && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">C. Contradicciones detectadas</p>
          <p className="text-xs text-slate-600">No se detectaron conflictos entre las respuestas actuales.</p>
        </div>
      )}

      {/* Supuestos abiertos (contexto para confianza) */}
      {assumptionsGaps.assumptions.length > 0 && !showOutput && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Supuestos abiertos</p>
          <ul className="space-y-1">
            {assumptionsGaps.assumptions.slice(0, 3).map((a, i) => (
              <li key={i} className="text-[11px] text-slate-600 leading-relaxed">— {a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OutputPanel = ({
  diagnostic, answers, inference, recommendation, financial, outputStatus,
  conflicts, confidence, assumptionsGaps, onEditStep,
  onSubmit, submitting, submitted, submitError, onDashboard,
}) => {
  const statusCfg = OUTPUT_STATUS_CFG[outputStatus];
  const confCfg   = CONFIDENCE_CFG[confidence];
  const canSubmit = outputStatus !== 'exploratory' && !submitted;

  return (
    <div className="space-y-4">

      {/* Status header */}
      <div className={`bg-[#0b1426] border rounded-2xl p-5 ${statusCfg.border}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-base font-bold text-white">Resultado del diagnóstico</h2>
          <span className={`text-xs font-medium shrink-0 mt-0.5 ${statusCfg.color}`}>{statusCfg.label}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-xs ${confCfg.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${confCfg.dot}`} />
          {confCfg.label}
        </div>
        {statusCfg.note && (
          <p className="text-xs text-slate-500 mt-2">{statusCfg.note}</p>
        )}
      </div>

      {/* 1. Perfil detectado */}
      <OutputSection title="1. Perfil detectado">
        {recommendation.inferredProfile && (
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">{recommendation.inferredProfile}</p>
        )}
        <div className="space-y-0 divide-y divide-slate-800">
          {[1, 2, 3, 4, 5].map(s => (
            <EditableRow
              key={s}
              label={s === 2 ? getStep2OutputLabel(diagnostic) : STEP_LABELS[s]}
              value={formatLegacyStepSummary(s, answers)}
              onEdit={() => onEditStep(s)}
            />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500">Sensibilidad de datos: </span>
          <span className="text-slate-300">{getSensitivityLabel(answers.governanceLevel)}</span>
        </div>
      </OutputSection>

      <DiagnosticReportPanel inference={inference} />

      {/* 2. Arquitectura sugerida */}
      <OutputSection title="2. Arquitectura sugerida">
        {recommendation.architecture
          ? <p className="text-sm text-white font-medium">{recommendation.architecture}</p>
          : <p className="text-xs text-slate-500">Define escala, gobernanza y el resto de pasos para completar esta sección.</p>
        }
        <p className="text-xs text-slate-600 mt-2">
          Los valores concretos de hardware y licencias se definen en la propuesta formal.
        </p>
      </OutputSection>

      {/* 3. Justificación */}
      {recommendation.justification.length > 0 && (
        <OutputSection title="3. Justificación">
          <ul className="space-y-2">
            {recommendation.justification.map((j, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-[#06b6d4] shrink-0 mt-0.5">→</span>
                {j}
              </li>
            ))}
          </ul>
        </OutputSection>
      )}

      {/* 4. Impacto de negocio */}
      {recommendation.businessImpact.length > 0 && (
        <OutputSection title="4. Impacto de negocio">
          <div className="space-y-3">
            {recommendation.businessImpact.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </OutputSection>
      )}

      {/* 5. Supuestos y escenario financiero */}
      <OutputSection title="5. Supuestos y límites">
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">Qué asumió el sistema</p>
          <ul className="space-y-1">
            {assumptionsGaps.assumptions.map((a, i) => (
              <li key={i} className="text-xs text-slate-500">— {a}</li>
            ))}
          </ul>
        </div>

        {assumptionsGaps.missingForProposal.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Información faltante para propuesta definitiva</p>
            <ul className="space-y-1">
              {assumptionsGaps.missingForProposal.map((m, i) => (
                <li key={i} className="text-xs text-amber-500/80">— {m}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs font-semibold text-slate-400 mb-2">
          Escenario comparativo <span className="font-normal text-slate-600">(basado en los parámetros ingresados)</span>
        </p>
        <div className="bg-slate-900/60 rounded-xl p-4 space-y-2 text-xs border border-slate-800">
          <Row
            label="Volumen asumido"
            value={`${financial.users} usuarios simultáneos, ~${financial.dailyQueries.toLocaleString()} consultas/día`}
          />
          <Row
            label="Supuesto de uso por consulta"
            value={`${financial.queriesPerUser} consultas/día por usuario (${financial.workingDays} días hábiles/mes)`}
          />
          <Row
            label="Costo estimado con APIs públicas por consumo"
            value={`$${financial.publicCostMonth.toLocaleString()}/mes (variable según uso real)`}
          />
          <Row
            label="Costo referencial de nodo dedicado"
            value={`$${financial.nodeMin.toLocaleString()}–$${financial.nodeMax.toLocaleString()}/mes (tarifa fija)`}
          />
          {financial.breakEvenMonths && (
            <Row
              label="Punto de equilibrio estimado"
              value={
                financial.breakEvenMonths === 1
                  ? 'Desde el primer mes con el volumen actual'
                  : `~${financial.breakEvenMonths} meses de uso al ritmo estimado`
              }
            />
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-2 italic">
          Esta simulación es orientativa. Los supuestos de uso se muestran explícitamente para que pueda validarlos.
          El costo real del nodo se define en la propuesta formal.
        </p>

        {conflicts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-amber-400 mb-1 font-medium">Condicionantes activos sobre la propuesta:</p>
            {conflicts.map(c => (
              <p key={c.id} className="text-xs text-slate-600">— Conflicto {c.id}: {c.title}</p>
            ))}
          </div>
        )}
      </OutputSection>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* 6. Siguiente paso */}
      <OutputSection title="6. Siguiente paso">
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">{inference.report.nextStep}</p>
        <p className="text-xs text-slate-500 mb-4">
          Guarde el diagnóstico para que el equipo ProxDeep elabore una propuesta comercial formal
          basada en este perfil y arquitectura sugerida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDashboard}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-all text-sm"
          >
            Ir al dashboard
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#06b6d4] text-white font-medium text-sm hover:bg-[#0ea5e9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitted
              ? <><Check className="h-4 w-4" /> Diagnóstico guardado</>
              : submitting
                ? 'Guardando...'
                : <><Send className="h-4 w-4" /> Guardar diagnóstico y solicitar propuesta</>}
          </button>
        </div>
        {outputStatus === 'exploratory' && !submitted && (
          <p className="text-xs text-slate-600 mt-3">
            Resuelve los conflictos activos o completa las respuestas pendientes para habilitar el envío.
            Puedes editar cualquier respuesta con el icono de edición arriba.
          </p>
        )}
      </OutputSection>
    </div>
  );
};

const DiagnosticReportPanel = ({ inference }) => {
  const { report } = inference;
  return (
    <OutputSection title="Informe ProxDeep">
      <h4 className="text-sm font-semibold text-white mb-4 leading-snug">{report.title}</h4>
      <div className="space-y-4">
        {DIAGNOSTIC_REPORT_BODY_SECTIONS.map(({ key, title }) => (
          <div key={key}>
            <p className="text-xs font-semibold text-slate-400 mb-1.5">{title}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{report[key]}</p>
          </div>
        ))}
      </div>
    </OutputSection>
  );
};

const OutputSection = ({ title, children }) => (
  <div className="bg-[#0b1426] border border-[#1e3a8a]/40 rounded-2xl p-5">
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
    {children}
  </div>
);

const EditableRow = ({ label, value, onEdit }) => (
  <div className="flex items-center justify-between py-2 gap-3">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-white font-medium text-right truncate">{value || '—'}</span>
      <button
        onClick={onEdit}
        title="Editar esta respuesta"
        className="text-slate-700 hover:text-[#06b6d4] transition-colors shrink-0"
      >
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-500">{label}</span>
    <span className="text-white font-medium text-right">{value}</span>
  </div>
);

export default ClientWizard;

"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, X, Search, MapPin, TrendingUp, AlertCircle, CheckCircle2, Circle, Zap, Building2, GraduationCap, Landmark, ChevronDown, ChevronRight, Trash2, Rocket, Filter } from "lucide-react";

// Coordenadas reais (lat, lon) das sedes municipais — fonte: IBGE
const MUNI_COORDS = {
  "Amparo de São Francisco": [-10.1348, -36.935],
  "Aquidabã": [-10.278, -37.0148],
  "Aracaju": [-10.9091, -37.0677],
  "Arauá": [-11.2614, -37.6201],
  "Areia Branca": [-10.758, -37.3251],
  "Barra dos Coqueiros": [-10.8996, -37.0323],
  "Boquim": [-11.1397, -37.6195],
  "Brejo Grande": [-10.4297, -36.4611],
  "Campo do Brito": [-10.7392, -37.4954],
  "Canhoba": [-10.1365, -36.9806],
  "Canindé de São Francisco": [-9.64882, -37.7923],
  "Capela": [-10.5069, -37.0628],
  "Carira": [-10.3524, -37.7002],
  "Carmópolis": [-10.6449, -36.9887],
  "Cedro de São João": [-10.2534, -36.8856],
  "Cristinápolis": [-11.4668, -37.7585],
  "Cumbe": [-10.352, -37.1846],
  "Divina Pastora": [-10.6782, -37.1506],
  "Estância": [-11.2659, -37.4484],
  "Feira Nova": [-10.2616, -37.3147],
  "Frei Paulo": [-10.5513, -37.5279],
  "Gararu": [-9.9722, -37.0869],
  "General Maynard": [-10.6835, -36.9838],
  "Gracho Cardoso": [-10.2252, -37.2006],
  "Ilha das Flores": [-10.4425, -36.5479],
  "Indiaroba": [-11.5157, -37.515],
  "Itabaiana": [-10.6826, -37.4273],
  "Itabaianinha": [-11.2693, -37.7875],
  "Itabi": [-10.1248, -37.1056],
  "Itaporanga d'Ajuda": [-10.99, -37.3078],
  "Japaratuba": [-10.5849, -36.9418],
  "Japoatã": [-10.3477, -36.8045],
  "Lagarto": [-10.9136, -37.6689],
  "Laranjeiras": [-10.7981, -37.1731],
  "Macambira": [-10.6619, -37.5413],
  "Malhada dos Bois": [-10.3418, -36.9252],
  "Malhador": [-10.6649, -37.3004],
  "Maruim": [-10.7308, -37.0856],
  "Moita Bonita": [-10.5769, -37.3512],
  "Monte Alegre de Sergipe": [-10.0256, -37.5616],
  "Muribeca": [-10.4271, -36.9588],
  "Neópolis": [-10.3215, -36.585],
  "Nossa Senhora Aparecida": [-10.3944, -37.4517],
  "Nossa Senhora da Glória": [-10.2158, -37.4211],
  "Nossa Senhora das Dores": [-10.4854, -37.1963],
  "Nossa Senhora de Lourdes": [-10.0772, -37.0615],
  "Nossa Senhora do Socorro": [-10.8468, -37.1231],
  "Pacatuba": [-10.4538, -36.6531],
  "Pedra Mole": [-10.6134, -37.6922],
  "Pedrinhas": [-11.1902, -37.6775],
  "Pinhão": [-10.5677, -37.7242],
  "Pirambu": [-10.7215, -36.8544],
  "Porto da Folha": [-9.91626, -37.2842],
  "Poço Redondo": [-9.80616, -37.6833],
  "Poço Verde": [-10.7151, -38.1813],
  "Propriá": [-10.2138, -36.8442],
  "Riachuelo": [-10.735, -37.1966],
  "Riachão do Dantas": [-11.0729, -37.731],
  "Ribeirópolis": [-10.5357, -37.438],
  "Rosário do Catete": [-10.6904, -37.0357],
  "Salgado": [-11.0288, -37.4804],
  "Santa Luzia do Itanhy": [-11.3536, -37.4586],
  "Santa Rosa de Lima": [-10.6434, -37.1931],
  "Santana do São Francisco": [-10.2922, -36.6105],
  "Santo Amaro das Brotas": [-10.7892, -37.0564],
  "Simão Dias": [-10.7387, -37.8097],
  "Siriri": [-10.5965, -37.1131],
  "São Cristóvão": [-11.0084, -37.2044],
  "São Domingos": [-10.7916, -37.5685],
  "São Francisco": [-10.3442, -36.8869],
  "São Miguel do Aleixo": [-10.3847, -37.3836],
  "Telha": [-10.2064, -36.8818],
  "Tobias Barreto": [-11.1798, -37.9995],
  "Tomar do Geru": [-11.3694, -37.8433],
  "Umbaúba": [-11.3809, -37.6623],
};

const MUNICIPIOS_SE = Object.keys(MUNI_COORDS).sort((a, b) => a.localeCompare(b, "pt-BR"));

const PUBLICOS = [
  { key: "gov", label: ".GOV", desc: "Prefeituras e órgãos públicos", icon: Landmark, color: "#3B6E5C" },
  { key: "edu", label: ".EDU", desc: "Escolas e instituições de ensino", icon: GraduationCap, color: "#B5562C" },
  { key: "com", label: ".COM", desc: "Empresas e setor privado", icon: Building2, color: "#3A5A8C" },
];

const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function loadKey(key, fallback) {
  return fallback;
}

// ---------- Storage helpers ----------
// storage is handled by the API route in Next.js

export default function AtivaSergipe() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [territorios, setTerritorios] = useState({}); // { municipio: {executions: [], startupAtendida: bool, eli: bool} }
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [openMuni, setOpenMuni] = useState(null);
  const [showForm, setShowForm] = useState(null); // municipio name when adding execution
  const [view, setView] = useState("painel"); // painel | lista

  // ---- Load data ----
  useEffect(() => {
    fetch("/api/territorios").then(r => r.json()).then(d => {
      setTerritorios(d || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next) => {
    setTerritorios(next);
    setSaving(true);
    await fetch("/api/territorios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
  }, []);

  function getMuni(name) {
    return territorios[name] || { executions: [], startupAtendida: false, eli: false };
  }

  // ---- Business rules ----
  function computeStatus(muniData) {
    const publicosComSolucao = new Set(muniData.executions.map(e => e.publico));
    const ativado = publicosComSolucao.size >= 2;
    const impulso = (ativado || muniData.eli) && muniData.startupAtendida;
    return { ativado, impulso, qtdPublicos: publicosComSolucao.size };
  }

  function addExecution(municipio, exec) {
    const current = getMuni(municipio);
    const next = {
      ...territorios,
      [municipio]: {
        ...current,
        executions: [...current.executions, { id: uid(), ...exec }],
      },
    };
    persist(next);
  }

  function removeExecution(municipio, execId) {
    const current = getMuni(municipio);
    const next = {
      ...territorios,
      [municipio]: {
        ...current,
        executions: current.executions.filter(e => e.id !== execId),
      },
    };
    persist(next);
  }

  function updateMuniFlag(municipio, field, value) {
    const current = getMuni(municipio);
    const next = { ...territorios, [municipio]: { ...current, [field]: value } };
    persist(next);
  }

  // ---- Derived stats ----
  const stats = useMemo(() => {
    let ativados = 0, impulso = 0, emAndamento = 0, semAcao = 0;
    MUNICIPIOS_SE.forEach(m => {
      const data = getMuni(m);
      const { ativado, impulso: imp } = computeStatus(data);
      if (ativado) ativados++;
      if (imp) impulso++;
      else if (data.executions.length > 0) emAndamento++;
      else semAcao++;
    });
    return { ativados, impulso, emAndamento, semAcao, total: MUNICIPIOS_SE.length };
  }, [territorios]);

  const filteredMunicipios = useMemo(() => {
    return MUNICIPIOS_SE.filter(m => {
      if (search && !m.toLowerCase().includes(search.toLowerCase())) return false;
      const data = getMuni(m);
      const { ativado, impulso } = computeStatus(data);
      if (filterStatus === "ativado" && !ativado) return false;
      if (filterStatus === "impulso" && !impulso) return false;
      if (filterStatus === "andamento" && (data.executions.length === 0 || ativado)) return false;
      if (filterStatus === "sem-acao" && data.executions.length > 0) return false;
      return true;
    });
  }, [search, filterStatus, territorios]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, fontFamily: "'Inter', sans-serif", color: "#6B6259" }}>
        Carregando territórios...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#FAF7F2", minHeight: "100vh", color: "#2A2520" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .as-root { font-family: 'Inter', sans-serif; }
        .as-display { font-family: 'Fraunces', serif; }
        .as-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .as-scroll::-webkit-scrollbar-thumb { background: #D8CFC0; border-radius: 3px; }
        button { font-family: inherit; cursor: pointer; }
        input, select { font-family: inherit; }
        .as-fade-in { animation: asfadein .25s ease; }
        @keyframes asfadein { from { opacity:0; transform: translateY(-4px);} to {opacity:1; transform:none;} }
      `}</style>

      <div className="as-root" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1F4D3D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={19} color="#F4C95D" strokeWidth={2.4} />
              </div>
              <h1 className="as-display" style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Ativa Sergipe</h1>
            </div>
            <p style={{ margin: 0, color: "#857A6C", fontSize: 14.5 }}>Acompanhamento da ativação de inovação nos territórios — ELI &amp; Programa Impulso</p>
          </div>
          <div style={{ fontSize: 12.5, color: saving ? "#B5562C" : "#9C9286", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? "#B5562C" : "#6FA287", display: "inline-block" }} />
            {saving ? "salvando…" : "dados sincronizados com a equipe"}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Territórios ativados" value={stats.ativados} total={stats.total} color="#1F4D3D" icon={CheckCircle2} />
          <StatCard label="Indicador Impulso" value={stats.impulso} total={stats.total} color="#F4C95D" textDark icon={Rocket} />
          <StatCard label="Em andamento" value={stats.emAndamento} total={stats.total} color="#B5562C" icon={AlertCircle} />
          <StatCard label="Sem ação registrada" value={stats.semAcao} total={stats.total} color="#9C9286" icon={Circle} />
        </div>

        {/* Mapa */}
        <MapaSergipe
          territorios={territorios}
          computeStatus={computeStatus}
          selectedMuni={openMuni}
          onSelectMuni={(nome) => {
            setOpenMuni(nome);
            setSearch("");
            setFilterStatus("todos");
            setTimeout(() => {
              const el = document.getElementById(`muni-card-${nome.replace(/\s+/g, "-")}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }}
        />

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9C9286" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar município..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 9, border: "1px solid #E5DDD0", background: "#fff", fontSize: 14, outline: "none" }}
            />
          </div>
          <FilterPills filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "#857A6C", marginBottom: 20, padding: "10px 14px", background: "#F1EBDD", borderRadius: 10 }}>
          <LegendItem color="#1F4D3D" label="Ativado (2+ públicos)" />
          <LegendItem color="#F4C95D" label="Conta p/ Indicador Impulso" border />
          <LegendItem color="#B5562C" label="Em andamento (1 público)" />
          <LegendItem color="#D8CFC0" label="Sem ação" />
          <span style={{ marginLeft: "auto" }}>Regra: 2 soluções para públicos diferentes (.GOV/.EDU/.COM) ativa o território.</span>
        </div>

        {/* Municipality list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredMunicipios.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9C9286", fontSize: 14 }}>Nenhum território encontrado.</div>
          )}
          {filteredMunicipios.map(m => (
            <MunicipioCard
              key={m}
              nome={m}
              data={getMuni(m)}
              status={computeStatus(getMuni(m))}
              isOpen={openMuni === m}
              onToggle={() => setOpenMuni(openMuni === m ? null : m)}
              onAddExecution={(exec) => addExecution(m, exec)}
              onRemoveExecution={(id) => removeExecution(m, id)}
              onUpdateFlag={(field, val) => updateMuniFlag(m, field, val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, border: border ? "1px solid #C9A53C" : "none", display: "inline-block" }} />
      {label}
    </div>
  );
}

function StatCard({ label, value, total, color, icon: Icon, textDark }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid #EFE8DA", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, color: "#857A6C", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={14} color={textDark ? "#2A2520" : "#fff"} strokeWidth={2.3} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="as-display" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 13, color: "#9C9286" }}>/ {total} ({pct}%)</span>
      </div>
      <div style={{ marginTop: 10, height: 4, background: "#F1EBDD", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function FilterPills({ filterStatus, setFilterStatus }) {
  const options = [
    { key: "todos", label: "Todos" },
    { key: "ativado", label: "Ativados" },
    { key: "impulso", label: "Indicador Impulso" },
    { key: "andamento", label: "Em andamento" },
    { key: "sem-acao", label: "Sem ação" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => setFilterStatus(o.key)}
          style={{
            padding: "8px 13px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: filterStatus === o.key ? "1px solid #1F4D3D" : "1px solid #E5DDD0",
            background: filterStatus === o.key ? "#1F4D3D" : "#fff",
            color: filterStatus === o.key ? "#fff" : "#6B6259",
            transition: "all .15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MunicipioCard({ nome, data, status, isOpen, onToggle, onAddExecution, onRemoveExecution, onUpdateFlag }) {
  const [formOpen, setFormOpen] = useState(false);
  const { ativado, impulso, qtdPublicos } = status;

  const borderColor = impulso ? "#F4C95D" : ativado ? "#1F4D3D" : data.executions.length > 0 ? "#B5562C" : "#EFE8DA";
  const statusLabel = impulso ? "Conta p/ Impulso" : ativado ? "Ativado" : data.executions.length > 0 ? "Em andamento" : "Sem ação";
  const statusColor = impulso ? "#9A7B1E" : ativado ? "#1F4D3D" : data.executions.length > 0 ? "#B5562C" : "#9C9286";
  const statusBg = impulso ? "#FBF0CF" : ativado ? "#E4EEE8" : data.executions.length > 0 ? "#F8E6DC" : "#F1EBDD";

  return (
    <div id={`muni-card-${nome.replace(/\s+/g, "-")}`} style={{ background: "#fff", border: `1px solid ${isOpen ? borderColor : "#EFE8DA"}`, borderLeft: `4px solid ${borderColor}`, borderRadius: 12, overflow: "hidden", transition: "border-color .15s" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer" }}>
        {isOpen ? <ChevronDown size={16} color="#9C9286" /> : <ChevronRight size={16} color="#9C9286" />}
        <MapPin size={15} color="#9C9286" />
        <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1 }}>{nome}</span>

        <div style={{ display: "flex", gap: 4 }}>
          {PUBLICOS.map(p => {
            const has = data.executions.some(e => e.publico === p.key);
            return (
              <div key={p.key} title={p.label} style={{
                width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: has ? p.color : "#F1EBDD", opacity: has ? 1 : 0.5,
              }}>
                <p.icon size={12.5} color={has ? "#fff" : "#9C9286"} strokeWidth={2.3} />
              </div>
            );
          })}
        </div>

        {data.eli && (
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 7px", borderRadius: 5, background: "#E8E2F3", color: "#5C4A8C" }}>ELI</span>
        )}

        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 7, background: statusBg, color: statusColor, whiteSpace: "nowrap" }}>
          {statusLabel}
        </span>
      </div>

      {isOpen && (
        <div className="as-fade-in" style={{ padding: "0 16px 16px 16px", borderTop: "1px solid #F4EFE5" }}>
          {/* Flags row */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "14px 0 10px 0" }}>
            <CheckboxRow
              checked={data.startupAtendida}
              onChange={v => onUpdateFlag("startupAtendida", v)}
              label="Startup atendida no município"
            />
            <CheckboxRow
              checked={data.eli}
              onChange={v => onUpdateFlag("eli", v)}
              label="Participa do ELI"
            />
          </div>

          {qtdPublicos > 0 && !ativado && (
            <div style={{ fontSize: 12.5, color: "#B5562C", background: "#F8E6DC", padding: "8px 12px", borderRadius: 8, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
              <AlertCircle size={13} /> Falta planejar e executar ação para mais {2 - qtdPublicos === 1 ? "1 público" : `${2 - qtdPublicos} públicos`} diferente{2-qtdPublicos>1?"s":""}.
            </div>
          )}

          {/* Executions table */}
          {data.executions.length > 0 && (
            <div style={{ overflowX: "auto", marginBottom: 12 }} className="as-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#9C9286", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.3 }}>
                    <th style={{ padding: "6px 8px" }}>Público</th>
                    <th style={{ padding: "6px 8px" }}>Solução / Evento</th>
                    <th style={{ padding: "6px 8px" }}>Mês exec.</th>
                    <th style={{ padding: "6px 8px" }}>Cód. solução</th>
                    <th style={{ padding: "6px 8px" }}>Cód. FOCO</th>
                    <th style={{ padding: "6px 8px" }}>Cód. evento</th>
                    <th style={{ padding: "6px 8px", width: 30 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.executions.map(e => {
                    const pub = PUBLICOS.find(p => p.key === e.publico);
                    return (
                      <tr key={e.id} style={{ borderTop: "1px solid #F4EFE5" }}>
                        <td style={{ padding: "8px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: pub.color, color: "#fff" }}>{pub.label}</span>
                        </td>
                        <td style={{ padding: "8px", fontWeight: 500 }}>{e.solucao}</td>
                        <td style={{ padding: "8px", color: "#6B6259" }}>{e.mes || "—"}</td>
                        <td style={{ padding: "8px", color: "#6B6259" }}>{e.codSolucao || "—"}</td>
                        <td style={{ padding: "8px", color: "#6B6259" }}>{e.codFoco || "—"}</td>
                        <td style={{ padding: "8px", color: "#6B6259" }}>{e.codEvento || "—"}</td>
                        <td style={{ padding: "8px" }}>
                          <button onClick={() => onRemoveExecution(e.id)} style={{ background: "none", border: "none", padding: 4, borderRadius: 5, display: "flex" }}>
                            <Trash2 size={13} color="#C9A53C" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!formOpen ? (
            <button
              onClick={() => setFormOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1F4D3D", background: "#E4EEE8", border: "none", padding: "8px 14px", borderRadius: 8 }}
            >
              <Plus size={14} /> Registrar execução
            </button>
          ) : (
            <ExecutionForm
              onCancel={() => setFormOpen(false)}
              onSubmit={(exec) => { onAddExecution(exec); setFormOpen(false); }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4A443B", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1F4D3D" }} />
      {label}
    </label>
  );
}

function ExecutionForm({ onCancel, onSubmit }) {
  const [publico, setPublico] = useState("gov");
  const [solucao, setSolucao] = useState("");
  const [mes, setMes] = useState("");
  const [codSolucao, setCodSolucao] = useState("");
  const [codFoco, setCodFoco] = useState("");
  const [codEvento, setCodEvento] = useState("");

  function submit() {
    if (!solucao.trim()) return;
    onSubmit({ publico, solucao: solucao.trim(), mes, codSolucao: codSolucao.trim(), codFoco: codFoco.trim(), codEvento: codEvento.trim() });
  }

  return (
    <div className="as-fade-in" style={{ background: "#FAF7F2", border: "1px solid #EFE8DA", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Nova execução</span>
        <button onClick={onCancel} style={{ background: "none", border: "none", padding: 2 }}><X size={15} color="#9C9286" /></button>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {PUBLICOS.map(p => (
          <button
            key={p.key}
            onClick={() => setPublico(p.key)}
            style={{
              flex: 1, padding: "8px 6px", borderRadius: 7, fontSize: 12.5, fontWeight: 600,
              border: publico === p.key ? `1.5px solid ${p.color}` : "1px solid #E5DDD0",
              background: publico === p.key ? p.color : "#fff",
              color: publico === p.key ? "#fff" : "#6B6259",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      <FormInput label="Solução / evento" value={solucao} onChange={setSolucao} placeholder="Ex: Palestra Educação Empreendedora" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 11.5, color: "#9C9286", fontWeight: 600, display: "block", marginBottom: 4 }}>Mês de execução</label>
          <select value={mes} onChange={e => setMes(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #E5DDD0", fontSize: 13, background: "#fff" }}>
            <option value="">Selecionar...</option>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <FormInput label="Cód. evento (FOCO)" value={codEvento} onChange={setCodEvento} placeholder="EV-12345" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <FormInput label="Código da solução" value={codSolucao} onChange={setCodSolucao} placeholder="212000113280" />
        <FormInput label="Código FOCO" value={codFoco} onChange={setCodFoco} placeholder="S26NA1PA580" />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={submit} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#1F4D3D", color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5 }}>
          Salvar execução
        </button>
        <button onClick={onCancel} style={{ padding: "9px 16px", borderRadius: 8, background: "#fff", color: "#6B6259", border: "1px solid #E5DDD0", fontWeight: 600, fontSize: 13.5 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: 11.5, color: "#9C9286", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #E5DDD0", fontSize: 13, outline: "none" }}
      />
    </div>
  );
}

// ── Mapa real de Sergipe (polígonos IBGE) ───────────────────────────────────
const SE_GEO = [{"name":"Amparo de S\u00e3o Francisco","rings":[[[356.3,209.0],[358.3,210.4],[366.6,214.1],[351.6,242.9],[353.9,206.5],[356.3,209.0]]]},{"name":"Aquidab\u00e3","rings":[[[320.8,227.0],[340.7,232.0],[346.8,245.6],[355.5,241.3],[353.3,260.1],[333.0,271.4],[331.4,278.6],[328.4,276.5],[322.0,281.5],[315.0,283.3],[309.4,288.1],[306.7,291.4],[302.5,293.3],[301.5,292.1],[298.5,289.1],[296.5,290.3],[294.8,289.5],[294.8,287.6],[292.0,281.3],[296.0,275.4],[296.4,268.6],[296.5,263.5],[298.8,254.7],[296.0,247.6],[297.6,235.1],[299.2,231.3],[295.2,221.6],[320.8,227.0]]]},{"name":"Aracaju","rings":[[[316.1,460.1],[324.3,460.1],[324.4,470.2],[326.4,491.2],[300.9,542.1],[292.2,558.2],[292.5,546.3],[289.7,534.7],[294.0,524.8],[308.6,495.9],[309.1,478.9],[307.6,468.8],[308.2,464.3],[316.1,460.1]]]},{"name":"Arau\u00e1","rings":[[[186.5,568.8],[189.4,570.6],[191.0,580.9],[194.4,585.3],[194.6,588.9],[197.1,596.7],[196.9,604.7],[194.9,608.4],[181.7,616.4],[174.0,623.1],[171.8,621.4],[157.1,602.3],[155.3,589.6],[160.5,581.4],[170.0,579.7],[175.2,575.5],[180.6,570.4],[187.8,565.2],[186.5,568.8]]]},{"name":"Areia Branca","rings":[[[250.1,416.9],[257.0,411.7],[260.0,413.9],[262.5,421.8],[259.7,440.2],[250.4,449.0],[245.2,451.5],[238.1,454.1],[226.4,449.0],[229.3,441.4],[234.6,427.4],[240.8,415.2],[246.5,413.0],[252.1,415.1],[250.1,416.9]]]},{"name":"Barra dos Coqueiros","rings":[[[370.6,418.0],[375.7,418.8],[353.5,448.4],[333.0,481.5],[329.1,489.6],[324.9,485.7],[325.5,466.7],[331.8,463.5],[334.6,458.2],[336.9,456.1],[340.8,454.7],[340.4,448.9],[344.7,449.3],[346.9,441.1],[352.6,436.6],[355.9,433.6],[367.6,420.2],[370.6,418.0]]]},{"name":"Boquim","rings":[[[193.5,524.2],[188.1,554.6],[189.3,558.8],[181.0,570.1],[177.8,573.1],[172.4,574.3],[163.1,573.8],[152.9,570.9],[145.7,571.9],[145.4,566.0],[154.7,556.8],[165.0,534.2],[170.9,532.9],[168.2,529.2],[182.3,518.0],[188.5,509.2],[193.5,524.2]]]},{"name":"Brejo Grande","rings":[[[498.4,339.8],[488.7,343.0],[471.5,340.2],[463.8,324.1],[475.6,314.3],[474.7,309.5],[486.6,307.8],[493.6,320.1],[500.0,335.9],[498.4,339.8]]]},{"name":"Campo do Brito","rings":[[[184.8,401.1],[191.5,402.1],[201.0,399.8],[206.1,404.0],[212.5,411.2],[214.5,425.5],[216.8,430.1],[215.8,431.9],[219.7,448.6],[227.4,446.3],[213.0,466.2],[209.0,456.1],[206.4,452.0],[202.8,448.5],[197.9,446.8],[194.6,441.4],[196.8,437.6],[195.0,436.0],[191.8,432.1],[187.8,432.5],[183.4,427.0],[183.8,421.4],[177.9,408.0],[178.1,397.4],[184.8,401.1]]]},{"name":"Canhoba","rings":[[[355.0,201.4],[356.3,209.0],[352.4,220.7],[346.8,245.6],[340.7,232.0],[320.8,227.0],[295.2,221.6],[318.7,211.8],[324.4,210.8],[327.5,210.5],[334.0,200.8],[348.7,189.7],[350.6,194.8],[355.0,201.4]]]},{"name":"Canind\u00e9 de S\u00e3o Francisco","rings":[[[78.0,6.5],[96.9,12.0],[111.3,27.2],[118.3,32.4],[124.2,42.1],[137.2,38.2],[152.4,45.3],[134.0,57.8],[114.3,63.5],[111.1,66.4],[105.5,91.4],[104.1,97.6],[101.7,115.8],[97.8,134.9],[93.0,138.3],[86.0,149.6],[77.7,155.5],[66.8,136.9],[70.0,127.8],[73.5,113.5],[75.3,103.9],[66.8,98.3],[58.6,89.0],[57.1,83.5],[54.5,67.2],[59.4,57.2],[67.0,46.1],[68.7,46.1],[64.0,41.4],[61.1,37.0],[55.6,23.3],[55.3,19.6],[59.0,20.4],[60.0,11.6],[62.6,4.5],[78.0,6.5]]]},{"name":"Capela","rings":[[[328.4,276.5],[331.4,278.6],[336.2,285.5],[341.1,291.5],[341.4,300.1],[345.1,310.2],[348.9,316.5],[353.7,318.8],[342.3,346.0],[342.7,350.7],[326.5,378.5],[318.4,369.3],[316.0,362.2],[317.7,345.9],[307.3,346.4],[305.6,333.2],[299.0,325.7],[304.2,315.8],[306.3,306.7],[306.5,303.4],[304.3,301.8],[302.5,293.3],[306.7,291.4],[309.4,288.1],[315.0,283.3],[322.0,281.5],[328.4,276.5]]]},{"name":"Carira","rings":[[[147.1,231.1],[150.2,234.9],[154.3,235.7],[167.9,248.6],[172.4,247.1],[175.1,250.8],[177.2,271.9],[168.1,305.3],[140.6,338.8],[127.5,338.0],[117.8,340.2],[116.7,338.6],[106.9,316.3],[105.8,303.9],[109.2,298.2],[111.0,294.9],[114.2,292.2],[123.6,286.1],[130.3,282.7],[136.0,273.7],[132.3,233.7],[147.1,231.1]]]},{"name":"Carm\u00f3polis","rings":[[[360.8,396.4],[361.7,403.2],[359.2,404.0],[351.6,399.1],[333.2,395.7],[341.4,380.5],[346.8,387.0],[356.9,396.0],[360.8,396.4]]]},{"name":"Cedro de S\u00e3o Jo\u00e3o","rings":[[[375.2,260.3],[367.0,267.8],[353.6,269.8],[355.5,241.3],[372.0,243.1],[378.3,254.6],[375.2,260.3]]]},{"name":"Cristin\u00e1polis","rings":[[[141.7,645.1],[146.5,649.7],[151.0,654.4],[154.7,662.0],[159.7,669.6],[162.1,676.3],[164.2,677.2],[164.2,682.7],[159.7,686.6],[157.5,691.4],[154.4,700.0],[147.1,697.9],[146.5,690.4],[139.7,694.6],[131.1,685.1],[128.1,687.3],[121.5,682.9],[114.9,677.2],[117.8,675.6],[111.3,670.8],[134.4,646.6],[140.8,642.3],[141.7,645.1]]]},{"name":"Cumbe","rings":[[[278.3,267.7],[280.3,267.5],[286.1,268.2],[290.6,274.8],[290.7,279.1],[289.3,280.9],[294.7,283.9],[293.2,288.7],[295.0,290.7],[297.4,290.5],[298.4,288.2],[302.2,292.2],[300.6,296.3],[307.3,301.8],[304.4,305.1],[301.6,305.5],[296.2,307.3],[293.7,305.5],[288.9,306.8],[280.4,302.4],[279.1,299.1],[274.6,293.8],[271.5,287.8],[272.7,269.5],[270.7,265.4],[266.5,256.7],[265.7,246.6],[272.5,258.8],[275.4,266.6],[278.3,267.7]]]},{"name":"Divina Pastora","rings":[[[280.3,372.4],[293.4,379.3],[297.8,385.0],[309.5,384.9],[312.2,386.3],[303.5,404.7],[295.2,411.6],[295.5,417.1],[292.7,421.4],[289.9,415.6],[287.4,410.2],[283.9,413.7],[281.3,409.5],[281.3,403.3],[282.3,396.1],[283.9,393.0],[287.3,388.6],[286.2,383.7],[280.9,378.3],[280.3,372.4]]]},{"name":"Est\u00e2ncia","rings":[[[245.0,563.0],[242.1,572.1],[247.0,579.3],[246.8,585.0],[251.9,591.2],[260.4,615.2],[248.3,653.4],[241.0,657.0],[227.9,654.2],[225.9,650.6],[231.3,632.2],[231.7,615.2],[222.2,609.2],[214.2,608.9],[204.4,609.6],[194.6,606.1],[199.3,599.6],[194.8,594.3],[193.4,588.8],[194.3,583.6],[192.4,573.6],[188.4,568.4],[185.9,567.1],[200.8,559.4],[212.3,556.1],[217.7,545.7],[220.0,542.1],[222.2,532.2],[232.3,525.0],[237.5,532.8],[245.2,544.6],[246.5,556.5],[245.0,563.0]]]},{"name":"Feira Nova","rings":[[[267.1,260.8],[272.1,267.9],[264.7,268.8],[263.2,272.6],[258.6,274.2],[254.5,277.2],[250.4,285.2],[248.1,293.1],[243.0,295.1],[241.8,293.7],[239.9,291.0],[243.0,289.0],[241.7,283.6],[240.1,279.3],[235.9,277.0],[232.9,273.0],[232.2,270.6],[231.0,265.6],[229.8,253.9],[232.4,239.7],[246.5,237.2],[266.5,256.7],[267.1,260.8]]]},{"name":"Frei Paulo","rings":[[[199.6,376.8],[170.9,373.1],[160.8,367.0],[140.4,339.0],[166.8,306.9],[185.5,316.7],[188.3,322.9],[201.1,345.5],[208.2,358.4],[199.6,376.8]]]},{"name":"Gararu","rings":[[[300.5,135.9],[318.7,157.0],[324.3,161.5],[337.7,156.9],[347.5,169.7],[347.8,170.6],[347.6,173.5],[329.0,183.9],[308.6,182.7],[301.7,184.8],[298.6,183.4],[289.5,182.1],[283.2,174.3],[284.8,176.9],[286.1,184.1],[282.9,188.9],[286.3,190.5],[279.1,191.7],[277.7,196.1],[276.3,199.5],[273.9,205.1],[275.1,206.3],[276.2,208.2],[276.8,211.5],[276.9,216.4],[274.0,219.6],[268.9,218.0],[265.5,219.6],[262.8,221.5],[260.1,219.8],[252.4,218.3],[246.7,209.1],[232.9,195.2],[225.7,183.1],[229.6,182.1],[232.3,175.8],[235.5,172.6],[237.1,167.9],[239.1,169.9],[240.5,166.9],[242.0,165.3],[244.6,160.8],[247.6,168.8],[250.9,168.0],[254.6,166.2],[258.3,163.2],[262.6,153.6],[266.8,151.2],[275.1,131.0],[300.5,135.9]]]},{"name":"General Maynard","rings":[[[353.6,402.7],[346.7,405.6],[341.5,404.2],[331.8,398.7],[339.5,397.7],[358.6,399.2],[353.6,402.7]]]},{"name":"Gracho Cardoso","rings":[[[281.5,218.0],[283.8,220.9],[289.1,224.6],[295.2,221.7],[299.4,233.5],[295.7,241.3],[298.2,249.4],[299.0,259.1],[295.6,263.8],[294.3,270.1],[291.6,278.6],[290.9,282.1],[289.1,279.4],[289.7,276.0],[287.2,270.2],[282.1,266.5],[279.3,267.7],[273.8,262.0],[270.8,254.9],[265.7,246.3],[252.4,218.3],[260.1,219.8],[262.8,221.5],[265.5,219.6],[268.9,218.0],[274.0,219.6],[276.9,216.4],[276.8,211.5],[281.5,218.0]]]},{"name":"Ilha das Flores","rings":[[[454.3,308.4],[468.5,308.9],[468.6,312.8],[472.1,315.7],[455.9,330.2],[444.2,332.9],[446.0,322.2],[448.1,319.0],[449.5,315.8],[450.9,313.7],[454.3,308.4]]]},{"name":"Indiaroba","rings":[[[191.7,648.1],[200.3,652.2],[205.1,657.4],[208.8,658.7],[211.8,657.6],[219.6,650.8],[225.9,650.7],[228.0,654.3],[227.4,672.7],[211.0,684.6],[196.9,688.8],[185.4,693.9],[181.3,691.1],[178.1,691.0],[177.1,686.2],[169.7,689.6],[164.4,680.9],[161.1,676.6],[160.0,670.7],[171.3,644.1],[179.8,643.4],[182.3,645.4],[191.7,648.1]]]},{"name":"Itabaiana","rings":[[[208.7,359.8],[222.1,361.7],[230.2,364.8],[230.9,370.5],[230.9,378.7],[233.7,377.8],[236.9,382.8],[238.5,387.1],[247.4,388.1],[246.9,410.1],[240.8,415.2],[234.6,427.4],[229.3,441.4],[220.9,448.3],[215.0,433.7],[217.1,432.2],[215.0,426.7],[214.2,416.9],[208.1,407.5],[201.2,401.6],[199.1,394.5],[195.4,388.2],[201.4,372.9],[208.7,359.8]]]},{"name":"Itabaianinha","rings":[[[126.8,551.5],[133.4,557.1],[139.6,562.6],[145.4,566.0],[145.7,571.9],[148.3,576.3],[153.3,586.6],[156.5,590.1],[157.1,605.0],[149.3,618.7],[139.1,643.1],[133.3,642.8],[130.0,643.9],[128.1,634.9],[124.0,630.7],[122.4,624.8],[116.0,616.9],[110.4,613.5],[107.1,608.9],[103.0,608.4],[98.9,604.7],[88.3,596.7],[92.0,581.7],[98.9,580.3],[101.0,576.9],[99.6,569.8],[107.7,561.1],[124.3,551.3],[126.8,551.5]]]},{"name":"Itabi","rings":[[[289.5,182.1],[298.6,183.4],[301.7,184.8],[308.6,182.7],[318.7,191.9],[311.9,214.7],[295.2,221.7],[289.1,224.6],[283.8,220.9],[281.5,218.0],[276.8,211.5],[276.2,208.2],[275.1,206.3],[273.9,205.1],[276.3,199.5],[277.7,196.1],[279.1,191.7],[286.3,190.5],[282.9,188.9],[286.1,184.1],[284.8,176.9],[283.2,174.3],[289.5,182.1]]]},{"name":"Itaporanga d'Ajuda","rings":[[[227.3,453.2],[241.4,455.0],[247.4,449.4],[246.7,485.5],[246.2,494.0],[253.5,501.5],[254.3,505.6],[259.2,514.2],[274.9,520.0],[281.0,535.5],[292.5,546.3],[292.2,558.2],[282.9,578.7],[260.0,599.4],[247.3,587.0],[246.5,580.8],[241.8,573.4],[243.9,566.0],[244.7,558.2],[244.5,550.1],[239.7,536.3],[234.0,529.8],[231.1,524.4],[226.8,515.7],[220.7,502.6],[213.2,498.5],[206.5,485.1],[202.2,473.8],[210.6,469.8],[227.0,446.9],[227.3,453.2]]]},{"name":"Japaratuba","rings":[[[369.5,305.9],[374.7,311.3],[371.3,320.4],[373.6,332.4],[380.0,338.3],[388.0,359.5],[379.5,376.4],[363.5,391.5],[360.5,392.8],[354.1,388.4],[344.7,380.4],[333.3,383.8],[342.7,349.0],[348.1,343.8],[354.5,310.9],[358.6,308.6],[362.1,306.0],[369.5,303.7],[369.5,305.9]]]},{"name":"Japoat\u00e3","rings":[[[391.9,263.7],[396.2,270.5],[403.6,272.3],[407.0,281.3],[416.8,303.7],[408.9,343.4],[402.4,367.8],[387.9,361.2],[382.0,346.8],[374.1,334.8],[372.0,329.1],[372.0,312.3],[371.8,308.2],[367.8,300.7],[375.3,295.5],[379.8,282.0],[385.5,271.3],[387.3,266.8],[390.2,263.1],[391.9,263.7]]]},{"name":"Lagarto","rings":[[[161.5,407.1],[169.3,408.0],[165.5,414.9],[168.8,420.4],[170.5,436.6],[174.0,443.1],[179.2,450.5],[187.2,451.8],[196.5,453.1],[201.8,449.3],[204.3,450.9],[207.2,458.2],[212.1,465.2],[208.5,469.9],[200.3,472.5],[208.1,488.3],[213.1,498.5],[195.9,492.8],[193.1,504.0],[188.0,509.7],[183.6,519.8],[164.9,528.2],[159.0,520.0],[151.2,515.5],[142.0,505.2],[134.9,505.2],[134.0,509.9],[129.3,509.6],[126.5,508.4],[122.1,512.8],[117.0,507.4],[114.3,504.8],[111.5,499.5],[109.6,491.1],[107.6,483.8],[102.3,471.5],[107.1,460.3],[118.8,452.0],[129.3,444.4],[138.2,437.2],[141.6,426.8],[145.2,416.9],[152.9,408.8],[159.6,407.2],[161.5,407.1]]]},{"name":"Laranjeiras","rings":[[[292.7,421.4],[297.2,426.5],[300.6,432.0],[312.5,432.3],[318.8,445.9],[306.1,448.0],[294.7,449.3],[289.2,452.6],[284.9,456.1],[273.7,450.5],[259.7,440.2],[274.4,424.9],[290.7,422.1],[292.7,421.4]]]},{"name":"Macambira","rings":[[[199.1,394.5],[194.0,400.0],[188.1,403.0],[181.2,400.6],[175.4,402.6],[172.7,407.0],[169.3,408.0],[161.5,407.1],[159.6,407.2],[156.3,406.5],[157.0,397.6],[159.0,386.1],[166.1,372.1],[193.0,385.4],[196.2,392.3],[199.1,394.5]]]},{"name":"Malhada dos Bois","rings":[[[359.5,294.7],[349.6,286.9],[348.1,264.2],[353.6,269.8],[363.1,284.7],[359.5,294.7]]]},{"name":"Malhador","rings":[[[256.2,370.2],[260.2,376.8],[266.0,386.6],[271.7,392.0],[273.4,402.8],[274.2,404.9],[271.7,406.9],[268.3,405.7],[264.5,408.3],[259.8,411.3],[250.9,417.8],[252.1,415.1],[246.5,413.0],[248.3,405.7],[247.4,388.1],[249.5,376.5],[256.2,370.2]]]},{"name":"Maruim","rings":[[[312.1,398.2],[317.6,401.1],[319.3,410.0],[317.5,427.6],[312.5,432.3],[300.6,432.0],[297.2,426.5],[292.7,421.4],[295.5,417.1],[295.2,411.6],[303.5,404.7],[311.2,395.0],[312.1,398.2]]]},{"name":"Moita Bonita","rings":[[[245.3,349.3],[249.6,349.5],[251.5,355.7],[256.8,361.7],[265.2,362.1],[264.5,365.3],[257.1,368.0],[251.1,375.0],[246.5,383.3],[242.6,389.6],[239.1,385.2],[236.4,380.8],[233.4,380.2],[231.4,375.8],[231.5,368.5],[229.6,363.9],[238.0,352.4],[245.3,349.3]]]},{"name":"Monte Alegre de Sergipe","rings":[[[194.8,168.4],[220.6,184.3],[224.8,188.9],[220.6,191.5],[217.4,194.4],[218.5,199.7],[212.0,200.4],[207.9,198.1],[203.8,200.1],[197.5,199.8],[194.6,203.0],[189.9,204.7],[185.6,207.0],[178.2,197.7],[175.6,198.5],[170.3,198.0],[164.0,203.0],[158.2,207.2],[154.8,209.6],[148.3,209.2],[138.6,203.4],[124.7,197.9],[120.7,202.5],[113.8,177.5],[132.5,174.2],[138.7,172.4],[146.7,170.2],[151.2,174.9],[159.1,170.1],[165.2,173.7],[170.2,174.2],[175.5,170.8],[178.9,164.8],[194.8,168.4]]]},{"name":"Muribeca","rings":[[[333.8,268.4],[355.9,295.3],[362.1,306.0],[358.6,308.6],[354.5,310.9],[351.7,317.0],[346.0,314.8],[340.7,302.8],[342.2,292.6],[337.0,286.0],[334.5,276.7],[333.0,271.8],[333.8,268.4]]]},{"name":"Ne\u00f3polis","rings":[[[404.0,254.5],[408.7,260.4],[415.3,260.2],[422.3,258.5],[447.3,268.2],[453.5,277.6],[454.7,296.8],[454.3,308.4],[451.1,314.8],[448.8,315.4],[446.8,317.1],[444.3,328.2],[444.3,334.7],[442.4,313.4],[440.9,305.6],[416.8,303.7],[407.0,281.3],[403.6,272.3],[396.2,270.5],[391.9,263.7],[389.7,262.2],[391.6,259.2],[401.2,252.1],[404.0,254.5]]]},{"name":"Nossa Senhora Aparecida","rings":[[[179.8,249.5],[182.7,252.7],[186.2,256.2],[190.6,253.5],[190.0,256.8],[192.8,261.7],[196.7,263.7],[199.2,264.4],[201.7,266.0],[206.0,261.7],[209.4,264.4],[211.3,260.3],[211.5,262.6],[215.6,264.1],[217.2,266.0],[220.5,270.3],[222.7,269.9],[225.4,269.4],[226.9,269.6],[224.6,283.3],[225.3,307.4],[205.4,322.2],[188.3,322.9],[185.5,316.7],[177.2,271.9],[175.1,250.8],[179.3,247.3],[179.8,249.5]]]},{"name":"Nossa Senhora da Gl\u00f3ria","rings":[[[225.3,187.4],[242.1,204.6],[251.4,217.7],[238.7,238.6],[228.6,252.5],[226.0,264.6],[223.3,269.8],[220.8,268.4],[218.6,266.4],[215.2,265.7],[212.2,263.5],[212.1,260.7],[209.7,261.5],[205.8,266.0],[204.4,262.1],[199.7,265.7],[196.8,263.8],[194.5,261.1],[188.9,257.0],[190.7,255.6],[187.5,254.8],[184.6,254.3],[181.5,250.5],[176.5,248.8],[173.9,249.6],[170.6,250.4],[161.0,242.2],[152.2,236.5],[148.4,236.1],[142.5,229.4],[125.6,229.3],[126.4,210.9],[136.3,202.6],[147.5,208.4],[152.8,207.2],[157.8,209.4],[162.0,203.1],[168.4,201.5],[174.7,197.4],[178.6,196.5],[184.2,202.0],[187.5,203.7],[192.7,204.1],[196.1,202.5],[202.5,198.4],[206.5,195.8],[212.1,198.1],[215.1,201.1],[219.3,194.4],[218.6,189.8],[224.5,191.5],[222.8,186.5],[225.3,187.4]]]},{"name":"Nossa Senhora das Dores","rings":[[[272.7,268.2],[271.5,281.7],[274.6,293.6],[275.8,295.4],[279.6,300.2],[287.4,307.1],[292.4,305.5],[295.1,307.9],[300.5,303.9],[304.2,304.9],[306.3,306.7],[304.2,315.8],[299.0,325.7],[293.0,347.6],[288.2,358.1],[288.8,362.9],[281.5,374.8],[277.3,375.6],[273.9,371.3],[265.2,362.1],[256.8,361.7],[251.5,355.7],[249.6,349.5],[248.2,346.6],[239.1,330.0],[254.9,327.3],[257.8,324.5],[258.0,318.2],[257.4,314.7],[253.0,310.5],[246.7,312.5],[248.7,308.8],[246.3,304.2],[244.1,296.3],[245.9,294.5],[250.8,287.7],[254.9,278.9],[256.6,274.4],[260.7,271.6],[262.3,269.8],[270.4,266.9],[272.7,268.2]]]},{"name":"Nossa Senhora de Lourdes","rings":[[[328.5,206.7],[325.3,210.6],[321.3,208.7],[318.7,191.9],[319.8,186.2],[345.5,174.3],[347.3,182.5],[338.8,193.7],[328.5,206.7]]]},{"name":"Nossa Senhora do Socorro","rings":[[[323.9,446.8],[326.6,461.3],[317.9,464.3],[309.9,463.8],[308.1,467.6],[307.3,473.7],[296.3,482.1],[291.3,477.9],[289.7,474.0],[284.7,467.8],[277.1,464.9],[268.5,456.8],[262.7,455.8],[252.7,449.3],[250.5,448.8],[278.1,454.5],[284.9,456.3],[293.4,450.5],[299.1,450.1],[308.0,444.7],[323.9,446.8]]]},{"name":"Pacatuba","rings":[[[438.8,366.2],[421.1,377.8],[403.8,368.1],[413.4,321.8],[430.9,301.6],[444.6,306.8],[442.8,316.7],[448.3,335.6],[472.0,348.9],[438.8,366.2]]]},{"name":"Pedra Mole","rings":[[[163.1,371.4],[157.4,388.5],[156.8,401.0],[157.3,408.2],[152.9,408.8],[153.3,402.7],[150.9,397.9],[146.1,393.6],[147.8,386.0],[146.6,384.0],[141.9,378.1],[145.9,372.2],[149.3,355.8],[160.8,367.0],[163.1,371.4]]]},{"name":"Pedrinhas","rings":[[[151.6,567.6],[155.5,568.7],[171.8,575.1],[175.2,575.5],[170.0,579.7],[160.5,581.4],[153.3,586.6],[148.3,576.3],[145.7,571.9],[151.6,567.6]]]},{"name":"Pinh\u00e3o","rings":[[[127.5,338.0],[150.3,347.1],[145.9,367.1],[143.9,372.9],[145.4,381.2],[141.2,381.3],[133.7,377.0],[129.0,371.8],[120.1,366.9],[115.2,364.9],[113.2,363.1],[110.7,360.0],[109.2,352.6],[112.3,349.8],[114.2,346.3],[120.8,338.8],[127.5,338.0]]]},{"name":"Pirambu","rings":[[[416.3,384.2],[378.4,415.9],[371.5,418.9],[370.7,416.1],[371.2,406.6],[367.0,403.2],[367.4,404.1],[363.0,404.8],[356.9,396.0],[362.4,391.1],[376.0,379.8],[399.6,363.3],[415.3,374.5],[422.6,378.6],[416.3,384.2]]]},{"name":"Po\u00e7o Redondo","rings":[[[188.8,122.6],[173.2,152.5],[168.9,156.4],[159.7,163.6],[154.5,174.0],[147.8,172.7],[138.8,173.5],[136.8,175.3],[118.0,176.2],[113.9,170.6],[99.8,158.1],[87.2,156.2],[86.0,149.6],[93.0,138.3],[97.8,134.9],[101.7,115.8],[104.1,97.6],[105.5,91.4],[111.1,66.4],[114.3,63.5],[134.0,57.8],[158.9,57.5],[173.7,69.6],[186.8,76.9],[208.3,79.0],[193.7,113.1],[193.2,114.0],[188.8,122.6]]]},{"name":"Po\u00e7o Verde","rings":[[[57.0,408.2],[68.7,423.3],[73.6,422.5],[74.2,436.2],[53.8,444.3],[42.9,445.6],[38.4,448.2],[34.2,452.9],[33.9,461.5],[28.7,472.2],[21.9,479.3],[17.3,487.1],[12.4,481.4],[8.1,480.1],[2.3,465.8],[1.5,447.0],[2.7,442.1],[3.2,435.7],[9.4,423.2],[8.0,412.4],[15.9,406.5],[23.9,408.2],[35.8,408.4],[52.9,405.9],[55.2,404.9],[57.0,408.2]]]},{"name":"Porto da Folha","rings":[[[273.8,135.6],[265.7,153.5],[264.4,163.2],[258.9,168.7],[253.0,165.3],[248.4,169.7],[246.0,166.7],[243.4,162.8],[241.2,163.3],[242.1,166.7],[237.6,170.7],[233.7,168.8],[233.5,172.6],[232.7,178.3],[228.2,180.9],[222.8,186.5],[204.4,171.4],[184.1,165.0],[176.7,170.9],[172.4,172.0],[166.3,172.8],[162.1,173.1],[157.0,164.8],[165.7,156.5],[173.2,152.6],[183.8,132.2],[193.3,114.0],[199.4,102.1],[223.4,84.5],[235.5,91.7],[244.4,97.3],[256.0,106.5],[266.9,117.7],[275.1,131.0],[273.8,135.6]]]},{"name":"Propri\u00e1","rings":[[[376.8,228.8],[378.0,229.9],[385.2,238.9],[402.1,244.3],[405.3,251.3],[416.8,257.7],[413.9,261.6],[406.5,258.2],[401.2,252.1],[391.6,259.2],[389.7,262.2],[380.5,264.3],[379.7,257.6],[376.3,246.5],[373.9,228.6],[376.8,228.8]]]},{"name":"Riach\u00e3o do Dantas","rings":[[[99.4,459.9],[106.3,483.9],[110.9,489.6],[109.5,496.1],[113.3,502.9],[115.8,508.7],[120.7,510.5],[125.1,510.0],[128.7,512.0],[132.6,507.5],[136.4,506.8],[140.3,503.9],[149.2,515.2],[155.2,517.0],[162.3,522.1],[170.1,530.1],[169.3,534.6],[160.9,543.4],[154.6,556.8],[143.9,563.8],[137.0,557.6],[130.5,554.5],[124.3,551.4],[108.4,543.3],[91.7,517.8],[84.5,508.2],[80.0,501.6],[84.1,497.0],[77.5,481.4],[82.7,466.0],[93.9,462.7],[99.4,459.9]]]},{"name":"Riachuelo","rings":[[[280.4,406.2],[282.3,410.9],[285.6,412.7],[288.9,412.0],[292.8,416.4],[290.7,422.1],[274.4,424.9],[262.9,420.1],[260.6,412.9],[262.8,409.1],[266.2,404.8],[269.9,406.2],[273.2,405.6],[275.7,405.6],[273.7,395.2],[282.3,400.4],[280.4,406.2]]]},{"name":"Ribeir\u00f3polis","rings":[[[236.7,319.4],[239.1,330.0],[248.2,346.6],[249.6,349.5],[245.3,349.3],[237.9,356.0],[224.9,362.5],[211.5,368.3],[208.2,358.4],[199.5,341.0],[195.4,322.6],[208.1,322.1],[235.8,317.8],[236.7,319.4]]]},{"name":"Ros\u00e1rio do Catete","rings":[[[333.3,397.6],[338.4,405.0],[344.3,406.2],[341.9,417.2],[331.7,411.5],[319.3,410.0],[317.6,401.1],[312.1,398.2],[312.2,386.3],[315.5,381.0],[316.4,375.2],[333.2,395.7],[333.3,397.6]]]},{"name":"Salgado","rings":[[[212.3,556.1],[200.8,559.4],[189.3,558.8],[188.1,554.6],[193.5,524.2],[193.1,504.0],[196.3,492.8],[213.2,498.5],[220.7,502.6],[226.8,515.7],[231.1,524.4],[217.8,539.2],[218.1,544.2],[218.2,549.4],[212.3,556.1]]]},{"name":"Santa Luzia do Itanhy","rings":[[[173.1,622.9],[179.3,617.6],[193.1,610.4],[204.4,609.6],[214.2,608.9],[222.2,609.2],[231.7,615.2],[231.3,632.2],[225.9,650.6],[222.3,652.9],[215.6,656.6],[209.5,658.5],[206.5,659.7],[202.9,657.3],[194.3,650.4],[183.7,646.5],[179.8,643.5],[173.6,638.7],[167.3,631.6],[154.1,616.6],[149.3,611.2],[171.8,621.4],[173.1,622.9]]]},{"name":"Santana do S\u00e3o Francisco","rings":[[[444.0,269.7],[422.9,257.3],[435.5,251.7],[438.4,253.7],[445.5,262.2],[444.0,269.7]]]},{"name":"Santa Rosa de Lima","rings":[[[264.5,365.3],[272.4,371.3],[277.2,373.8],[280.9,378.3],[286.2,383.7],[287.3,388.6],[283.9,393.0],[282.3,396.1],[271.7,392.0],[266.0,386.6],[260.2,376.8],[256.2,370.2],[260.3,365.5],[264.5,365.3]]]},{"name":"Santo Amaro das Brotas","rings":[[[358.6,399.2],[359.9,405.7],[362.5,401.3],[364.3,405.9],[365.9,403.2],[368.6,402.4],[371.0,412.4],[371.6,416.6],[367.6,420.2],[355.9,433.6],[352.6,436.6],[346.9,441.1],[344.7,449.3],[340.4,448.9],[340.8,454.7],[336.9,456.1],[334.6,458.2],[331.8,463.5],[325.5,466.7],[327.9,451.6],[315.9,440.6],[314.5,430.7],[317.2,421.3],[331.7,411.5],[341.9,417.2],[353.6,402.7],[358.6,399.2]]]},{"name":"S\u00e3o Crist\u00f3v\u00e3o","rings":[[[257.6,455.9],[265.9,456.1],[272.4,461.6],[282.7,468.9],[288.3,472.1],[291.2,477.8],[294.6,480.5],[309.1,478.9],[308.6,495.9],[294.0,524.8],[289.7,534.7],[286.7,538.1],[275.6,528.5],[259.3,515.5],[255.5,509.8],[253.7,504.0],[248.5,496.5],[244.8,487.9],[250.3,449.8],[255.3,454.2],[257.6,455.9]]]},{"name":"S\u00e3o Domingos","rings":[[[176.8,404.3],[182.2,419.0],[184.2,424.7],[185.4,430.8],[191.5,432.8],[193.1,434.9],[195.4,438.2],[194.7,441.3],[194.6,444.7],[201.8,449.3],[196.5,453.1],[187.2,451.8],[179.2,450.5],[174.0,443.1],[170.5,436.6],[168.8,420.4],[165.5,414.9],[169.3,408.0],[172.7,407.0],[175.4,402.6],[176.8,404.3]]]},{"name":"S\u00e3o Francisco","rings":[[[380.5,264.3],[385.5,271.3],[379.8,282.0],[375.3,295.5],[359.0,299.4],[363.1,284.7],[368.5,266.5],[378.3,254.6],[380.2,261.4],[380.5,264.3]]]},{"name":"S\u00e3o Miguel do Aleixo","rings":[[[229.8,263.7],[231.6,269.3],[231.5,274.4],[235.4,277.9],[238.3,277.5],[239.2,282.9],[243.1,287.5],[240.7,289.1],[241.8,293.6],[244.1,296.3],[246.3,304.2],[248.7,308.8],[246.7,312.5],[253.0,310.5],[257.4,314.7],[258.0,318.2],[257.8,324.5],[254.9,327.3],[239.1,330.0],[236.7,319.4],[225.3,307.3],[226.3,273.9],[227.3,264.9],[229.8,253.9],[229.8,263.7]]]},{"name":"Sim\u00e3o Dias","rings":[[[116.1,368.2],[124.2,370.1],[129.1,376.0],[136.4,380.9],[140.6,383.6],[146.6,384.0],[147.8,386.0],[146.1,393.6],[150.9,397.9],[153.3,402.7],[152.9,408.8],[145.2,416.9],[141.6,426.8],[138.2,437.2],[129.3,444.4],[118.8,452.0],[107.1,460.3],[99.4,459.9],[84.4,465.6],[73.5,465.4],[74.2,436.2],[73.6,422.5],[90.7,413.9],[98.0,410.2],[108.2,405.0],[116.2,398.8],[115.2,364.9],[116.1,368.2]]]},{"name":"Siriri","rings":[[[308.2,345.6],[317.4,345.8],[317.3,360.8],[317.9,367.0],[316.4,375.2],[315.5,381.0],[310.8,383.0],[300.1,387.3],[297.6,378.4],[288.2,378.5],[288.8,362.9],[288.2,358.1],[293.0,347.6],[299.0,325.7],[305.6,333.2],[308.2,345.6]]]},{"name":"Telha","rings":[[[377.2,220.8],[377.7,228.9],[375.0,225.5],[372.0,243.1],[355.5,241.3],[368.5,214.8],[377.2,220.8]]]},{"name":"Tobias Barreto","rings":[[[59.1,443.4],[73.5,465.4],[81.2,488.0],[80.8,499.8],[82.7,507.8],[89.0,514.7],[102.1,533.4],[112.5,557.9],[103.5,565.6],[101.4,574.8],[101.7,581.9],[96.8,578.8],[85.8,592.2],[68.9,622.7],[66.6,620.6],[68.6,615.5],[65.8,609.5],[62.2,603.5],[68.0,599.2],[68.6,596.9],[70.4,590.6],[67.9,588.1],[72.2,581.8],[71.8,576.1],[71.6,571.6],[67.2,571.3],[59.9,566.8],[49.3,562.1],[47.1,554.7],[47.5,546.8],[42.2,542.4],[42.9,539.5],[43.4,528.4],[41.6,523.8],[39.7,519.4],[38.7,511.3],[32.7,512.4],[27.3,506.9],[17.6,495.8],[17.3,487.1],[21.9,479.3],[28.7,472.2],[33.9,461.5],[34.2,452.9],[38.4,448.2],[42.9,445.6],[53.8,444.3],[59.1,443.4]]]},{"name":"Tomar do Geru","rings":[[[85.8,592.2],[92.8,599.0],[101.0,603.3],[106.0,607.7],[109.9,612.9],[114.2,615.0],[116.0,619.3],[123.7,628.7],[126.2,635.3],[130.6,640.6],[133.4,644.5],[118.2,646.7],[109.4,670.4],[103.0,661.4],[106.0,658.3],[101.9,657.0],[100.2,652.2],[97.8,651.0],[93.1,655.1],[92.1,650.4],[91.2,645.3],[85.4,643.2],[83.3,650.2],[81.6,648.9],[79.4,644.0],[76.7,643.1],[74.9,639.3],[74.6,636.3],[71.9,630.8],[85.8,592.2]]]},{"name":"Umba\u00faba","rings":[[[173.6,638.7],[163.1,663.4],[157.9,671.6],[153.5,658.5],[149.4,653.7],[146.1,648.4],[140.8,642.3],[149.3,630.9],[149.3,611.2],[154.1,616.6],[167.3,631.6],[173.6,638.7]]]}];

// viewBox do SVG
const MAP_W = 500, MAP_H = 700;

function ringToPath(ring) {
  if (!ring || ring.length < 2) return "";
  return "M " + ring.map(([x,y]) => `${x},${y}`).join(" L ") + " Z";
}

function MapaSergipe({ territorios, computeStatus, onSelectMuni, selectedMuni }) {
  const [tooltip, setTooltip] = React.useState(null);

  function getMuniData(name) {
    return territorios[name] || { executions: [], startupAtendida: false, eli: false };
  }

  function getFillColor(nome) {
    const data = getMuniData(nome);
    const { ativado, impulso } = computeStatus(data);
    if (impulso) return "#F4C95D";
    if (ativado) return "#1F4D3D";
    if (data.executions.length > 0) return "#C8623A";
    return "#D5CBBC";
  }

  function getStroke(nome) {
    const { impulso } = computeStatus(getMuniData(nome));
    if (impulso) return { stroke: "#9A7B1E", strokeWidth: "2.5" };
    if (nome === selectedMuni) return { stroke: "#fff", strokeWidth: "2" };
    return { stroke: "#fff", strokeWidth: "0.7" };
  }

  function getStatusLabel(nome) {
    const data = getMuniData(nome);
    const { ativado, impulso, qtdPublicos } = computeStatus(data);
    if (impulso) return "✦ Conta p/ Impulso";
    if (ativado) return "✔ Ativado";
    if (qtdPublicos === 1) return "⚡ Em andamento";
    return "○ Sem ação";
  }

  // Calcula centróide simples de um ring
  function centroid(ring) {
    const n = ring.length;
    let cx = 0, cy = 0;
    for (const [x, y] of ring) { cx += x; cy += y; }
    return [cx / n, cy / n];
  }

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #EFE8DA",
      borderRadius: 16,
      padding: "16px 20px 14px",
      marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#2A2520" }}>Mapa dos Territórios — Sergipe</span>
          <span style={{ fontSize: 12, color: "#9C9286", marginLeft: 10 }}>Passe o mouse · Clique para abrir município</span>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#6B6259" }}>
          <MapLegendDot color="#1F4D3D" label="Ativado" />
          <MapLegendDot color="#F4C95D" label="Conta p/ Impulso" border />
          <MapLegendDot color="#C8623A" label="Em andamento" />
          <MapLegendDot color="#D5CBBC" label="Sem ação" />
        </div>
      </div>

      <div style={{ position: "relative", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ width: "100%", maxWidth: MAP_W, display: "block", background: "#EBF4FA", borderRadius: 10, border: "1px solid #D8E8F0" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Fundo oceano/mar */}
          <rect width={MAP_W} height={MAP_H} fill="#EBF4FA" rx="10" />

          {SE_GEO.map(({ name, rings }) => {
            const fill = getFillColor(name);
            const { stroke, strokeWidth } = getStroke(name);
            const isSelected = name === selectedMuni;
            const { impulso } = computeStatus(getMuniData(name));
            const mainRing = rings[0];
            const [cx, cy] = centroid(mainRing);

            return (
              <g
                key={name}
                style={{ cursor: "pointer" }}
                onClick={() => onSelectMuni(name)}
                onMouseEnter={() => setTooltip({ name, cx, cy })}
                onMouseLeave={() => setTooltip(null)}
              >
                {rings.map((ring, i) => (
                  <path
                    key={i}
                    d={ringToPath(ring)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={isSelected ? 0.85 : 1}
                  />
                ))}
                {/* Borda extra dourada para Impulso */}
                {impulso && rings.map((ring, i) => (
                  <path
                    key={"imp-" + i}
                    d={ringToPath(ring)}
                    fill="none"
                    stroke="#C9A53C"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    pointerEvents="none"
                  />
                ))}
                {/* Destaque selecionado */}
                {isSelected && rings.map((ring, i) => (
                  <path
                    key={"sel-" + i}
                    d={ringToPath(ring)}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    pointerEvents="none"
                  />
                ))}
              </g>
            );
          })}

          {/* Tooltip embutido no SVG */}
          {tooltip && (() => {
            const { name, cx, cy } = tooltip;
            const label = getStatusLabel(name);
            const fill = getFillColor(name);
            const boxW = 160, boxH = 46;
            let bx = cx + 10;
            let by = cy - boxH / 2;
            if (bx + boxW > MAP_W - 4) bx = cx - boxW - 10;
            if (by < 4) by = 4;
            if (by + boxH > MAP_H - 4) by = MAP_H - boxH - 4;
            const data = getMuniData(name);
            const { eli } = data;

            // Quebrar nome em até 2 linhas
            const words = name.split(" ");
            const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
            const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
            const twoLines = line2.length > 0;

            return (
              <g style={{ pointerEvents: "none" }}>
                <rect x={bx} y={by} width={boxW} height={boxH} rx="6" fill="#1E1A16" opacity="0.9" />
                {twoLines ? (
                  <>
                    <text x={bx + 10} y={by + 13} fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{line1}</text>
                    <text x={bx + 10} y={by + 24} fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{line2}</text>
                  </>
                ) : (
                  <text x={bx + 10} y={by + 17} fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{name}</text>
                )}
                <rect x={bx + 10} y={by + 29} width={8} height={8} rx="2" fill={fill} />
                <text x={bx + 22} y={by + 37} fontSize="10" fill="#D8CFC0" fontFamily="Inter,sans-serif">{label}</text>
                {eli && <text x={bx + boxW - 30} y={by + 37} fontSize="9" fill="#B8A8E0" fontFamily="Inter,sans-serif" fontWeight="700">ELI</text>}
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

function MapLegendDot({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 11, height: 11, borderRadius: "50%", background: color, display: "inline-block",
        border: border ? "2px solid #9A7B1E" : "1.5px solid rgba(0,0,0,0.1)",
        flexShrink: 0,
      }} />
      <span>{label}</span>
    </div>
  );
}


import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function currencyBR(v) {
  if (v === 0 || v) return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return '-';
}
function pct(v){
  if (isNaN(v)) return '-';
  return `${v.toFixed(2)}%`;
}

export default function App(){
  const [rows, setRows] = useState([]);
  const [month, setMonth] = useState('Todos');
  const [platform, setPlatform] = useState('Todas');

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      setRows(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const months = useMemo(() => ['Todos', ...Array.from(new Set(rows.map(r => r['Mês/Ano'])))], [rows]);
  const platforms = useMemo(() => ['Todas', ...Array.from(new Set(rows.map(r => r['Plataforma'])))], [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => (month==='Todos' || r['Mês/Ano']===month) && (platform==='Todas' || r['Plataforma']===platform));
  }, [rows, month, platform]);

  const sum = (field) => filtered.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);

  const gasto = sum('Gasto Real');
  const receita = sum('Receita');
  const leads = sum('Leads');
  const vendas = sum('Vendas');
  const roi = gasto ? ((receita - gasto) / gasto) * 100 : 0;
  const roas = gasto ? (receita / gasto) : 0;

  const kpis = [
    { title: 'Gasto Real', value: currencyBR(gasto) },
    { title: 'Receita', value: currencyBR(receita) },
    { title: 'ROI (%)', value: pct(roi) },
    { title: 'ROAS', value: roas.toFixed(2) },
    { title: 'Leads', value: leads },
    { title: 'Vendas', value: vendas },
  ];

  const COLORS = ['#4D96FF','#00C49F','#FFC658','#8884d8','#ff8042','#a78bfa','#22d3ee','#f472b6'];

  return (
    <div className="container">
      <h1>Dashboard de Marketing</h1>
      <div className="toolbar">
        <input className="file" type="file" accept=".xlsx,.xls" onChange={onFile} />
        <select className="select" value={month} onChange={e=>setMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="badge">{filtered.length} linhas</span>
      </div>

      {rows.length === 0 ? (
        <p className="footer">Faça upload do seu arquivo <b>.xlsx</b> (colunas esperadas: <i>Mês/Ano, Plataforma, Gasto Real, Receita, Leads, Vendas, CTR (%), CPC, etc.</i>).</p>
      ) : (
      <>
        <div className="grid" style={{marginBottom:16}}>
          {kpis.map(k => (
            <div className="kpi" key={k.title}>
              <h3>{k.title}</h3>
              <div className="value">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid">
          <div className="card" style={{gridColumn:'span 3'}}>
            <div className="section-title">Receita vs Gasto</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Plataforma" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Receita" />
                <Bar dataKey="Gasto Real" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{gridColumn:'span 3'}}>
            <div className="section-title">Distribuição de Gasto</div>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={filtered} dataKey="Gasto Real" nameKey="Plataforma" outerRadius={120} label>
                  {filtered.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{gridColumn:'span 6'}}>
            <div className="section-title">ROI e CTR por Mês</div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={
                  Object.values(filtered.reduce((acc, r) => {
                    const key = r['Mês/Ano'];
                    if(!acc[key]) acc[key] = { mes:key, receita:0, gasto:0, ctr:0, count:0 };
                    acc[key].receita += Number(r['Receita']) || 0;
                    acc[key].gasto += Number(r['Gasto Real']) || 0;
                    acc[key].ctr += Number(r['CTR (%)']) || 0;
                    acc[key].count += 1;
                    return acc;
                  }, {})).map(row => ({
                    mes: row.mes,
                    roi: row.gasto ? ((row.receita - row.gasto) / row.gasto) * 100 : 0,
                    ctr: row.count ? row.ctr / row.count : 0
                  }))
                }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roi" name="ROI (%)" />
                <Line type="monotone" dataKey="ctr" name="CTR (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{gridColumn:'span 6', height: 'auto'}}>
            <div className="section-title">Detalhamento</div>
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(filtered[0]).map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([k,v]) => <td key={k}>{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} Dashboard Marketing • Tema escuro • Recharts + SheetJS</div>
      </>
      )}
    </div>
  );
}

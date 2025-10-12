import React from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
function App(){
  const [data,setData]=useState(null)
  useEffect(()=>{fetch(API+'/api/tournament/demo/research').then(r=>r.json()).then(setData)},[])
  if(!data) return <div>Loading…</div>
  return (<div style={{fontFamily:'system-ui,sans-serif',padding:16}}>
    <h1>The Lumber Yard</h1>
    <h2>{data.meta.name}</h2>
    <div>Field strength: {data.field_strength.metric}</div>
    <h3>Form</h3>
    <ul>{data.player_form.map(p=> <li key={p.player_id}>{p.name} — {p.last8_avg.toFixed(1)}</li>)}</ul>
  </div>)
}
createRoot(document.getElementById('root')).render(<App/>)

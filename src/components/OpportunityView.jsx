import React, { useState, useMemo, useEffect } from 'react';
import outcomesData from '../data/customer_outcomes_scored.json';
import dummyInitiativesData from '../data/dummy_initiatives.json';

const OpportunityView = ({ initiativeId, onOutcomeClick }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  
  const [activeLegend, setActiveLegend] = useState(null); // 'Loyalty Journey', etc
  const [activeInitiative, setActiveInitiative] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [journeyFilter, setJourneyFilter] = useState('All');

  // Format data
  const data = useMemo(() => {
    const unique = new Map();
    outcomesData.forEach(row => {
      const text = row.Customer_Outcome?.trim();
      const imp = parseFloat(row.Importance_Score);
      const sat = parseFloat(row.Satisfaction_Score);
      const sos = parseFloat(row.SOS);
      
      if (!text || isNaN(imp) || isNaN(sat) || isNaN(sos)) return;
      
      const key = `${row.Journey_Name}|${text}`;
      if (!unique.has(key) || sos > unique.get(key).sos) {
        // Simple deterministic jitter based on text length and scores
        const jitterX = (text.length % 10 - 5) * 0.05;
        const jitterY = ((imp * 10) % 10 - 5) * 0.05;

        unique.set(key, {
          id: key,
          journeyLabel: row.Journey_Name,
          step: row.Job_Step_Label || row.ODI_Step || 'Unknown Step',
          text,
          imp: imp + jitterX,
          sat: sat + jitterY,
          sos,
          isHighOpportunity: row.High_Opportunity === true || row.High_Opportunity === 'True'
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => b.sos - a.sos);
  }, []);

  // Map dummy initiatives to parsed outcomes to inherit their Journey label
  const initiatives = useMemo(() => {
    return dummyInitiativesData.map(init => {
      // Find all outcomes mapped to this initiative in the full dataset
      const linkedOutcomes = init.outcomes.map(text => data.find(d => d.text === text)).filter(Boolean);
      // Determine the primary journey(s)
      const journeys = [...new Set(linkedOutcomes.map(o => o.journeyLabel))];
      return {
        ...init,
        journeys,
        linkedOutcomes
      };
    });
  }, [data]);

  // Handle cross-navigation from Journey view
  useEffect(() => {
    if (initiativeId) {
      const target = initiatives.find(i => i.id === initiativeId);
      if (target && activeInitiative?.id !== target.id) {
        setActiveInitiative(target);
      }
    }
  }, [initiativeId, initiatives, activeInitiative]);

  const journeyColors = {
    'Loyalty Journey': '#E40000',
    'Money Journey': '#041D3B',
    'Cards Journey': '#8DE3E5'
  };

  const statusColors = {
    'Backlog': '#94a3b8',
    'Prediscovery': '#FF5E9B',
    'Discovery': '#8DE3E5',
    'Development': '#26A515'
  };

  const activeNode = selectedNode || hoveredNode;

  // Chart Dimensions
  const containerWidth = 900;
  const containerHeight = 600;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = containerWidth - padding.left - padding.right;
  const height = containerHeight - padding.top - padding.bottom;

  const domainMin = -0.5;
  const domainMax = 10.5;
  const domainRange = domainMax - domainMin;

  const xScale = (val) => ((val - domainMin) / domainRange) * width;
  const yScale = (val) => height - ((val - domainMin) / domainRange) * height;

  const handleMouseMove = (e, node) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredNode(node);
  };

  // Node highlighting constraints
  const isNodeDimmed = (node) => {
    if (activeLegend && activeLegend !== node.journeyLabel) return true;
    if (activeInitiative) {
      return !activeInitiative.linkedOutcomes.some(o => o.id === node.id);
    }
    return false;
  };

  const filteredInitiatives = initiatives.filter(init => {
    if (statusFilter !== 'All' && init.status !== statusFilter) return false;
    // Map journey names backward from the dropdown since dropdown values are short
    const fullJourneyName = `${journeyFilter} Journey`;
    if (journeyFilter !== 'All' && !init.journeys.includes(fullJourneyName)) return false;
    return true;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#333', margin: '0 0 8px 0' }}>Opportunity Landscape</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            Plotting {data.length} customer outcomes across all journeys based on Importance vs Satisfaction.
          </p>
        </div>
        
        {/* Legend / Journey Toggles */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {Object.entries(journeyColors).map(([name, color]) => (
            <div 
              key={name} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#444', 
                cursor: 'pointer', opacity: activeLegend && activeLegend !== name ? 0.3 : 1, transition: 'opacity 0.2s',
                backgroundColor: activeLegend === name ? color + '15' : 'transparent',
                padding: '4px 8px', borderRadius: '4px'
              }}
              onClick={() => setActiveLegend(activeLegend === name ? null : name)}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
              {name.replace(' Journey', '')}
            </div>
          ))}
        </div>
      </div>

      {/* CHART & DETAILS ROW */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '40px' }}>
        
        {/* CHART CONTAINER */}
        <div 
          style={{ 
            position: 'relative', 
            width: `${containerWidth}px`, 
            height: `${containerHeight}px`,
            backgroundColor: '#fcfcfc',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {activeInitiative && (
            <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e40000', boxShadow: '0 4px 12px rgba(228,0,0,0.15)', zIndex: 10 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#e40000', textTransform: 'uppercase', marginBottom: '2px' }}>Highlighting Outcomes for:</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>{activeInitiative.name}</div>
                <button onClick={() => setActiveInitiative(null)} style={{ marginTop: '6px', fontSize: '11px', color: '#666', border: 'none', background: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Clear Highlight</button>
            </div>
          )}

          <svg width={containerWidth} height={containerHeight}>
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {/* Background ODI Zones */}
              <polygon points={`${xScale(0)},${yScale(0)} ${xScale(10)},${yScale(10)} ${xScale(0)},${yScale(10)}`} fill="#f1f5f9" opacity="0.6" />
              <polygon points={`${xScale(0)},${yScale(0)} ${xScale(10)},${yScale(10)} ${xScale(10)},${yScale(8)} ${xScale(2)},${yScale(0)}`} fill="#f8fafc" opacity="0.4" />
              
               {/* Grid Lines */}
              {[0, 2, 4, 6, 8, 10].map(val => (
                <g key={`grid-x-${val}`}>
                  <line x1={xScale(val)} y1={0} x2={xScale(val)} y2={height} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <text x={xScale(val)} y={yScale(0) + 20} textAnchor="middle" fontSize="11" fill="#888">{val}</text>
                </g>
              ))}
               {[0, 2, 4, 6, 8, 10].map(val => (
                <g key={`grid-y-${val}`}>
                  <line x1={0} y1={yScale(val)} x2={width} y2={yScale(val)} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <text x={xScale(0) - 15} y={yScale(val) + 4} textAnchor="end" fontSize="11" fill="#888">{val}</text>
                </g>
              ))}

               {/* Axes shifted for padding */}
              <line x1={0} y1={yScale(0)} x2={width} y2={yScale(0)} stroke="#333" strokeWidth="2" />
              <line x1={xScale(0)} y1={0} x2={xScale(0)} y2={height} stroke="#333" strokeWidth="2" />
              
              <text x={width / 2} y={height + 45} textAnchor="middle" fontWeight="bold" fontSize="13" fill="#333">Importance Score &#8594;</text>
              <text x={-height / 2} y={-40} textAnchor="middle" transform="rotate(-90)" fontWeight="bold" fontSize="13" fill="#333">Satisfaction Score &#8594;</text>

              <line x1={xScale(6)} y1={yScale(0)} x2={xScale(10)} y2={yScale(8)} stroke="#e40000" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
              <text x={xScale(8.5)} y={yScale(3.5)} transform={`rotate(-45, ${xScale(8.5)}, ${yScale(3.5)})`} fill="#e40000" fontSize="11" opacity="0.6" fontWeight="bold">Extreme Opportunity (SOS &gt; 12)</text>

              {data.map(node => {
                const isHovered = activeNode?.id === node.id;
                const dimmed = isNodeDimmed(node);
                const r = Math.max(6, Math.min(18, (node.sos / 15) * 14));
                
                return (
                  <circle
                    key={node.id}
                    cx={xScale(node.imp)}
                    cy={yScale(node.sat)}
                    r={isHovered ? r + 3 : r}
                    fill={journeyColors[node.journeyLabel] || '#999'}
                    fillOpacity={dimmed ? 0.08 : (isHovered ? 1 : 0.8)}
                    stroke={isHovered || (activeInitiative && !dimmed) ? '#000' : 'rgba(0,0,0,0.1)'}
                    strokeWidth={isHovered ? 2 : (activeInitiative && !dimmed ? 1.5 : 0.5)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseMove={(e) => handleMouseMove(e, node)}
                    onClick={() => {
                        setSelectedNode(node === selectedNode ? null : node);
                        setActiveInitiative(null); // Click node clears specific init highlight
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          {hoveredNode && (
            <div 
              style={{
                position: 'absolute',
                left: Math.min(hoverPos.x + 20, containerWidth - 300),
                top: Math.min(hoverPos.y + 20, containerHeight - 200),
                width: '280px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(228, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                pointerEvents: 'none',
                zIndex: 100
              }}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', color: journeyColors[hoveredNode.journeyLabel] || '#666', marginBottom: '4px' }}>
                {hoveredNode.journeyLabel} • {hoveredNode.step}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', lineHeight: '1.4', marginBottom: '10px' }}>
                "{hoveredNode.text}"
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '11px', color: '#555' }}>
                <div><div style={{ opacity: 0.7 }}>Importance</div><div style={{ fontWeight: 700, color: '#333' }}>{hoveredNode.imp.toFixed(1)}</div></div>
                <div><div style={{ opacity: 0.7 }}>Satisfaction</div><div style={{ fontWeight: 700, color: '#333' }}>{hoveredNode.sat.toFixed(1)}</div></div>
                <div><div style={{ opacity: 0.7, color: '#e40000', fontWeight: 700 }}>SOS</div><div style={{ fontWeight: 800, color: '#e40000', fontSize: '12px' }}>{hoveredNode.sos.toFixed(1)}</div></div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#333' }}>Outcome Focus</h3>
            {activeNode ? (
              <>
                <div style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: (journeyColors[activeNode.journeyLabel] || '#666') + '20', color: journeyColors[activeNode.journeyLabel], borderRadius: '14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  {activeNode.journeyLabel}
                </div>
                <div 
                  onClick={() => onOutcomeClick && onOutcomeClick(activeNode.text)}
                  style={{ fontSize: '18px', fontWeight: '500', color: '#111', lineHeight: '1.4', fontStyle: 'italic', marginBottom: '16px', cursor: 'pointer', textDecoration: 'underline decoration-dotted', textUnderlineOffset: '2px' }}
                >
                  "{activeNode.text}"
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: 700, marginBottom: '4px' }}>SOS Target</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: activeNode.sos >= 10 ? '#e40000' : '#333' }}>{activeNode.sos.toFixed(1)}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: 700, marginBottom: '4px' }}>Status</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: activeNode.isHighOpportunity ? '#e40000' : '#148943', marginTop: '6px' }}>
                            {activeNode.isHighOpportunity ? 'Underserved' : 'Appropriate'}
                        </div>
                    </div>
                </div>
              </>
            ) : (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px', fontStyle: 'italic', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px dashed #ddd', padding: '20px', textAlign: 'center' }}>
                Hover or click an outcome dot on the landscape to view its details.
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flex: 1 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#333' }}>Active Initiatives Mapped to Outcome</h3>
            
            {!activeNode ? (
                <div style={{ color: '#888', fontSize: '13px' }}>Select an outcome to view linked strategic initiatives originating from the lists below.</div>
            ) : (() => {
                const linkedInits = initiatives.filter(i => i.outcomes.includes(activeNode.text));
                if (linkedInits.length === 0) {
                    return (
                        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', borderLeft: '4px solid #e40000' }}>
                             <div style={{ fontSize: '15px', fontWeight: '800', color: '#b91c1c', marginBottom: '4px' }}>No Initiatives</div>
                             <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: '1.4', fontWeight: '500' }}>This opportunity is currently unaddressed by the business. There are no active initiatives mapped to this outcome.</div>
                        </div>
                    );
                }
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {linkedInits.map(init => (
                             <div key={init.id} style={{ padding: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', borderLeft: `4px solid ${statusColors[init.status] || '#ccc'}` }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{init.name}</div>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: statusColors[init.status], textTransform: 'uppercase', backgroundColor: statusColors[init.status] + '15', padding: '2px 6px', borderRadius: '4px' }}>{init.status}</span>
                                 </div>
                                 <div style={{ fontSize: '12px', color: '#666' }}>ID: {init.id}</div>
                             </div>
                        ))}
                    </div>
                );
            })()}
          </div>

        </div>
      </div>

      {/* STRATEGIC INITIATIVES GRID */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0e0e0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#333', margin: '0 0 4px 0' }}>Initiatives</h2>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Click an initiative card below to highlight the specific outcomes it addresses in the scatter plot above.</p>
            </div>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px' }}>
                 <select 
                    value={journeyFilter} onChange={e => setJourneyFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', fontWeight: '600', color: '#444', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                 >
                    <option value="All">All Journeys</option>
                    <option value="Loyalty">Loyalty Journey</option>
                    <option value="Money">Money Journey</option>
                    <option value="Cards">Cards Journey</option>
                 </select>
                 <select 
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', fontWeight: '600', color: '#444', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                 >
                    <option value="All">All Statuses</option>
                    {Object.keys(statusColors).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                 </select>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredInitiatives.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#888', backgroundColor: '#fafafa', borderRadius: '12px' }}>No initiatives match the selected filters.</div>
            ) : filteredInitiatives.map(init => {
                const isActive = activeInitiative?.id === init.id;
                return (
                <div 
                    key={init.id}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the chart highlight
                        setTimeout(() => {
                           setActiveInitiative(isActive ? null : init);
                           setSelectedNode(null); // Clear selected node
                        }, 50);
                    }}
                    style={{ 
                        border: '1px solid',
                        borderColor: isActive ? '#e40000' : '#e2e8f0',
                        borderRadius: '10px',
                        padding: '16px',
                        backgroundColor: isActive ? '#fffcfc' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(228,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                        transform: isActive ? 'translateY(-2px)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#888' }}>{init.id}</div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: statusColors[init.status], backgroundColor: statusColors[init.status] + '15', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {init.status}
                        </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: isActive ? '#e40000' : '#111', lineHeight: '1.3', marginBottom: '12px' }}>
                        {init.name}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {init.journeys.map(j => (
                            <span key={j} style={{ fontSize: '10px', backgroundColor: (journeyColors[j] || '#ccc') + '15', color: journeyColors[j] || '#666', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>
                                {j.replace(' Journey', '')}
                            </span>
                        ))}
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#666', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Maps to {init.linkedOutcomes.length} outcome{init.linkedOutcomes.length !== 1 ? 's' : ''}</span>
                        {isActive && <span style={{ color: '#e40000', fontWeight: '600' }}>Highlighted ↑</span>}
                    </div>
                </div>
            )})}
        </div>
      </div>
    </div>
  );
};

export default OpportunityView;

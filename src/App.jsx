import React, { useState, useEffect, useRef, useCallback } from 'react';
import { journeyData } from './data/journeyData';
import QantasView from './components/QantasView';
import QantasLoyaltyView from './components/QantasLoyaltyView';
import ProcessView from './components/ProcessView';
import OpportunityView from './components/OpportunityView';
import dummyInitiativesData from './data/dummy_initiatives.json';
import './index.css';
import OneCustomerIcon from './assets/icons/One Customer.svg';
import RedLight from './assets/icons/red-traffic-light.svg';
import OrangeLight from './assets/icons/orange-traffic-light.svg';
import GreenLight from './assets/icons/green-traffic-light.svg';

const RenderSection = ({ section, onRowSelect, selectedRow, scoringData }) => {
  const getTrafficLight = (sos) => {
    if (sos >= 5.2) return RedLight;
    if (sos >= 4.6) return OrangeLight;
    return GreenLight;
  };

  const calculateStepSOS = (companyName, stepLabel) => {
    if (!scoringData || !scoringData[companyName]) return 0;
    const stepOutcomes = scoringData[companyName][stepLabel] || [];
    if (stepOutcomes.length === 0) return 0;
    const total = stepOutcomes.reduce((sum, o) => sum + Number(o.SOS), 0);
    return total / stepOutcomes.length;
  };

  return (
    <div className="content-section">
      <div className="section-banner-row">
        <div className="title-group">
          <div className="user-icon">
            <img src={OneCustomerIcon} alt="One Customer" />
          </div>
          <div 
            className="section-title" 
            onClick={() => selectedRow && onRowSelect && onRowSelect('__deselect__')}
            style={{ cursor: selectedRow ? 'pointer' : 'default' }}
          >
            {selectedRow === 'Loyalty' ? 'Qantas Loyalty Customer Lifecycle' : section.title}
          </div>
        </div>

        <div className="stage-banner">
          {section.stages.map((stage, idx) => (
            <div key={idx} className="stage-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {typeof stage === 'string' ? stage : (
                <>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>{stage.main}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{stage.sub}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="company-card">
        {section.companies
          .filter(company => !selectedRow || company.name.includes(selectedRow))
          .map((company, idx) => {
          const isClickable = !!onRowSelect && company.name.includes('Loyalty');
          
          return (
            <div 
              key={idx} 
              className="company-row"
              onClick={() => isClickable && onRowSelect(company.name)}
              style={{ 
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              {company.options ? (
                <div className="company-name">
                  <select
                    defaultValue={company.name}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#333',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%',
                      padding: '0',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    {company.options.map(opt => (
                      <option 
                        key={opt.value} 
                        value={opt.value} 
                        disabled={!opt.enabled}
                        style={{ color: opt.enabled ? '#333' : '#aaa' }}
                      >
                        {opt.value}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="company-name">{company.name}</div>
              )}
              <div className="company-bar" style={{ height: '36px' }}>
                {section.stages.map((stageLabel, i) => {
                  const companyName = company.name === 'Qantas Loyalty' ? 'Loyalty Journey' : 
                                      company.name.includes('Money') ? 'Money Journey' : 
                                      company.name.includes('Cards') ? 'Cards Journey' : company.name;
                  const sos = calculateStepSOS(companyName, stageLabel);
                  
                  return (
                    <div
                      key={i}
                      className="company-segment"
                      style={{ backgroundColor: company.color }}
                    >
                      <div className="traffic-light-pill" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 4px' }}>
                        {sos > 0 && <span style={{ color: 'white', fontSize: '10px', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{sos.toFixed(1)}</span>}
                        <img src={getTrafficLight(sos)} alt="status" style={{ width: '10px', height: '10px', visibility: 'hidden', position: 'absolute' }} />
                        <div style={{ 
                          width: '10px', height: '10px', borderRadius: '50%', 
                          backgroundColor: sos >= 5.2 ? '#E40000' : (sos >= 4.6 ? '#F5A623' : '#26A515'),
                          boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const navItems = ['One Customer', 'Qantas', 'Qantas Loyalty', 'Opportunity'];

// Inline expanded detail component for journey bars
import journeys from './data/aggregated_journeys.json';
import top5Outcomes from './data/top5_outcomes_by_step.json';
import ReviewCarouselModal from './components/ReviewCarouselModal';

const subtitles = {
  'Loyalty Journey': 'Get rewards and benefits from the loyalty program',
  'Money Journey': 'Earn rewards through financial and insurance products',
  'Cards Journey': 'Earn rewards with a credit card'
};

const ExpandedJourneyDetail = ({ companyName, onInitiativeClick, onOutcomeClick }) => {
  const [expandedDrivers, setExpandedDrivers] = useState({});

  const toggleDriver = (key) => {
    setExpandedDrivers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamically find the correct level from backend json data
  let level = 'L1';
  if (companyName.includes('Loyalty')) level = 'L2';
  else if (companyName.includes('Money')) level = 'L3';
  else if (companyName.includes('Cards')) level = 'L4';

  const journey = journeys.find(j => j.Level === level);
  if (!journey || !journey.Jobs) return null;

  const { Jobs } = journey;

  const getJourneyQuotes = (lvl) => {
    const defaultQuotes = [
      "I love Qantas. I do sometimes feel like something has been lost, though",
      "The value equation feels complex."
    ];
    
    if (lvl === 'L2') { // Loyalty
      return [
        "I've been sitting on 500,000 points for two years. Finding somewhere to actually spend them is getting harder every time I look.",
        "I spend more time planning how to earn points than planning the actual trip.",
        "The reward seat was technically free. The taxes came to $1,301. Free is getting expensive.",
        "I built a spreadsheet to track what the app should already be telling me correctly.",
        "Every time they change the earn rates, I change my strategy. The earn rates change a lot.",
        "The status felt earned. The points just feel like they're waiting for Qantas to change the rules again."
      ];
    }
    if (lvl === 'L3') { // Money
      return [
        "There's always a better offer out there. The trick is finding it before it closes.",
        "I can spend an hour on the maths and still not be sure it stacks up.",
        "I pressed submit and held my breath. Now I just need the bonus to actually show up.",
        "Keeping track of it all is basically a second job. And it doesn't always pay what it promised.",
        "The strategy changes whenever life does. Lately, life's been changing a lot.",
        "I gave it two years. I'm not sure I ended up ahead, honestly."
      ];
    }
    if (lvl === 'L4') { // Cards
      return [
        "I didn't realise a single card application could get me most of the way to a Business Class seat.",
        "I've mapped the whole year out. If the earn rates hold, this actually works perfectly.",
        "Crossing to a new card felt bigger than it should. Now I need to make it earn its keep.",
        "I track every transaction. Half the time the points don't arrive the way they said they would.",
        "I stopped chasing flights. The card earn path fits my life better now, and that's fine.",
        "When the upgrade came through for the whole family, every dollar of that annual fee felt worth it."
      ];
    }
    return defaultQuotes;
  };

  const currentQuotes = getJourneyQuotes(level);


  const metricsData = [
    ["Perceptions of Qantas Brand", "Overall NPS: +45", "Brand Trust: 86%"],
    ["Value Perception: Good", "Brand Affinity: 78%", "NPS Momentum: +2"],
    ["Service Perception: 8.2/10", "NPS (Frequent): +52", "Brand Health: Strong"],
    ["Innovation Perception: 7.9/10", "NPS (Infrequent): +35", "Preference Rank: #1"],
    ["Reliability Perception: 8.5/10", "NPS Target: +50", "Brand Equity: High"],
    ["Perceptions of Qantas Brand", "Overall NPS: +45", "Brand Trust: 86%"],
    ["Service Perception: 8.2/10", "NPS (Frequent): +52", "Brand Health: Strong"]
  ];



  const labelStyle = {
    width: '120px',
    minWidth: '120px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#333',
    flexShrink: 0,
    padding: '10px 8px 10px 0'
  };

  const cellStyle = {
    flex: 1,
    fontSize: '12px',
    padding: '10px 8px',
    minWidth: 0
  };

  return (
    <div style={{ marginBottom: '16px', marginTop: '4px' }}>
      {/* Header bar removed to prevent duplication */}

      {/* Customer Goal Row removed as per request to restore underneath journey labels */}

      {/* Job to be Done Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
        <div style={labelStyle}>Job to be Done</div>
        <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
          {Jobs.map((job, i) => (
            <div key={i} style={{ ...cellStyle, fontWeight: '600' }}>{job.Job_Name}</div>
          ))}
        </div>
      </div>

      {/* Outcome Rows — sourced from top5_outcomes_by_step.json */}
      {[0, 1, 2, 3, 4].map(outcomeIndex => {
        const outcomeKey = `Outcome ${outcomeIndex + 1}`;
        // Check if any job step has an outcome at this index
        const hasAnyData = Jobs.some(job => {
          const stepData = top5Outcomes[companyName]?.[job.ODI_Step];
          return stepData && stepData[outcomeIndex];
        });
        if (!hasAnyData) return null;

        return (
          <React.Fragment key={outcomeKey}>
            <div 
              style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
              onClick={() => toggleDriver(outcomeKey)}
            >
              <div style={labelStyle}>
                <span style={{ fontSize: '11px', marginRight: '6px' }}>{expandedDrivers[outcomeKey] ? '▼' : '▶'}</span>
                Outcome ({outcomeIndex + 1})
              </div>
              <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                {Jobs.map((job, cIdx) => {
                  const outcome = top5Outcomes[companyName]?.[job.ODI_Step]?.[outcomeIndex];
                  return (
                    <div key={cIdx} style={{ ...cellStyle, fontStyle: 'italic', color: '#111' }}>
                      {outcome ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <span style={{
                            display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: outcome.SOS >= 5.2 ? '#E40000' : (outcome.SOS >= 4.6 ? '#F5A623' : '#26A515'),
                            marginRight: '8px', marginTop: '5px'
                          }}></span>
                          <span 
                            onClick={() => onOutcomeClick && onOutcomeClick(outcome.Customer_Outcome)}
                            onMouseOver={(e) => { e.currentTarget.style.color='#e40000'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color='#111'; }}
                            style={{ cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'underline decoration-dotted', textUnderlineOffset: '2px' }}
                          >
                            "{outcome.Customer_Outcome}"
                          </span>
                        </div>
                      ) : <span style={{ color: '#ccc' }}>-</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {expandedDrivers[outcomeKey] && (
              <>
                {['Importance', 'Satisfaction', 'SOS'].map(metric => (
                  <div key={metric} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fffcfc', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ ...labelStyle, paddingLeft: '28px', fontSize: '12px', color: '#666', fontStyle: 'italic', fontWeight: '500' }}>{metric}</div>
                    <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                      {Jobs.map((job, cIdx) => {
                        const outcome = top5Outcomes[companyName]?.[job.ODI_Step]?.[outcomeIndex];
                        if (!outcome) return <div key={cIdx} style={{ ...cellStyle, color: '#ccc' }}>-</div>;
                        const val = metric === 'Importance' ? outcome.Importance_Score : metric === 'Satisfaction' ? outcome.Satisfaction_Score : outcome.SOS;
                        const isSOS = metric === 'SOS';
                        const num = Number(val);
                        return (
                          <div key={cIdx} style={{ 
                            ...cellStyle, 
                            fontWeight: '700', 
                            color: isSOS ? (num >= 5.2 ? '#E40000' : (num >= 4.6 ? '#F5A623' : '#26A515')) : '#333'
                          }}>
                            {isSOS ? num.toFixed(1) : `${num.toFixed(1)} / 10`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Emotional Experience Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
        <div style={labelStyle}>Emotional Experience</div>
        <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
          {Jobs.map((j, i) => (
            <div key={i} style={cellStyle}>
              <div style={{
                fontStyle: 'italic', fontWeight: '500', color: '#444',
                backgroundColor: '#fdfdfd', padding: '10px 12px', borderRadius: '6px',
                borderLeft: '4px solid #e2e8f0', border: '1px solid #eee',
                borderLeftWidth: '4px', fontSize: '12px', lineHeight: '1.4'
              }}>
                {currentQuotes[i] || ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
        <div style={labelStyle}>Metrics</div>
        <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
          {Jobs.map((j, i) => (
            <div key={i} style={cellStyle}>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.5', fontSize: '12px' }}>
                {metricsData[i % metricsData.length].map((m, mIdx) => <li key={mIdx} style={{ marginBottom: '3px' }}>{m}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Active Initiatives Row - aggregated dynamically from step outcomes */}
      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
        <div style={labelStyle}>
          <div style={{ lineHeight: '1.2' }}>Initiatives</div>
          <div style={{ fontSize: '10px', color: '#888', fontWeight: 'normal', marginTop: '4px' }}>(Addressing Step Outcomes)</div>
        </div>
        <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
          {Jobs.map((job, i) => {
            const stepOutcomes = top5Outcomes[companyName]?.[job.ODI_Step] || [];
            const stepOutcomeTexts = stepOutcomes.map(o => o.Customer_Outcome);
            
            const stepInits = dummyInitiativesData.filter(init => 
               init.outcomes.some(o => stepOutcomeTexts.includes(o))
            );

            return (
              <div key={i} style={cellStyle}>
                                                    {stepInits.length === 0 ? <span style={{color: '#ccc', fontStyle:'italic', fontSize:'11px'}}>None active</span> : stepInits.map((init, iIdx) => (
                                                        <div key={iIdx} 
                                                            onClick={() => onInitiativeClick && onInitiativeClick(init.id)}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                backgroundColor: '#f8fafc',
                                                                color: '#334155',
                                                                padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                                                                fontWeight: '600', marginRight: '6px', marginBottom: '6px',
                                                                border: '1px solid #e2e8f0',
                                                                borderLeft: `3px solid ${{'Backlog': '#94a3b8', 'Prediscovery': '#FF5E9B', 'Discovery': '#8DE3E5', 'Development': '#26A515'}[init.status] || '#cbd5e1'}`,
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.2s',
                                                            }}
                                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        >
                                                            <div style={{ padding: '2px 4px', backgroundColor: `${{'Backlog': '#94a3b8', 'Prediscovery': '#FF5E9B', 'Discovery': '#8DE3E5', 'Development': '#26A515'}[init.status]}15`, color: {'Backlog': '#94a3b8', 'Prediscovery': '#FF5E9B', 'Discovery': '#8DE3E5', 'Development': '#26A515'}[init.status], borderRadius: '4px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1' }}>
                                                                {init.status}
                                                            </div>
                                                            <span>{init.name}</span>
                                                        </div>
                                                    ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('One Customer');
  const [navProps, setNavProps] = useState({});
  const [selectedOutcomeForReviews, setSelectedOutcomeForReviews] = useState(null);
  const [selectedLifecycleRow, setSelectedLifecycleRow] = useState(null);
  const [selectedJourneyHierarchy, setSelectedJourneyHierarchy] = useState('Cards');
  const [expandedJourneyBar, setExpandedJourneyBar] = useState(null);
  const [visibleJourney, setVisibleJourney] = useState(null);
  const journeyDetailRefs = useRef({});
  const mainContentRef = useRef(null);

  const handleNavigation = (view, props = {}) => {
    setActiveView(view);
    setNavProps(props);
    window.scrollTo(0, 0);
  };

  // Track which expanded journey detail is scrolled into the sticky header area
  const setJourneyDetailRef = useCallback((name, el) => {
    if (el) {
      journeyDetailRefs.current[name] = el;
    } else {
      delete journeyDetailRefs.current[name];
    }
  }, []);

  useEffect(() => {
    const scrollContainer = mainContentRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const headerBottom = 60; // approx height of sticky header
      let found = null;
      
      for (const [name, el] of Object.entries(journeyDetailRefs.current)) {
        const rect = el.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const relTop = rect.top - containerRect.top;
        const relBottom = rect.bottom - containerRect.top;
        
        // If the detail section overlaps the sticky header zone
        if (relTop < headerBottom && relBottom > headerBottom) {
          found = name;
          break;
        }
      }
      
      setVisibleJourney(found);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [expandedJourneyBar]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_JOURNEY') {
        const payload = event.data;
        let mappedJourney = 'Loyalty Journey'; 
        if (payload.journey && payload.journey.includes('Credit Card')) mappedJourney = 'Cards Journey';
        if (payload.journey && payload.journey.includes('Money App')) mappedJourney = 'Money Journey';

        // Switch contexts gracefully
        setActiveView('One Customer');
        setSelectedLifecycleRow('Loyalty');
        setExpandedJourneyBar(mappedJourney);

        // Allow React a moment to render the expanded section, then scroll to it
        setTimeout(() => {
          if (journeyDetailRefs.current[mappedJourney] && mainContentRef.current) {
            const el = journeyDetailRefs.current[mappedJourney];
            const container = mainContentRef.current;
            const topPos = el.offsetTop - 70; // 70px offset for the sticky header
            container.scrollTo({ top: topPos, behavior: 'smooth' });
          }
        }, 200);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const { lifecycleSection, journeySection } = journeyData.oneCustomer;

  const handleRowSelect = (companyName) => {
    if (companyName === '__deselect__') {
      setSelectedLifecycleRow(null);
      setSelectedJourneyHierarchy('Cards');
      setExpandedJourneyBar(null);
    } else if (companyName.includes('Loyalty')) {
      const isLoyalty = selectedLifecycleRow === 'Loyalty';
      setSelectedLifecycleRow(isLoyalty ? null : 'Loyalty');
      setSelectedJourneyHierarchy(isLoyalty ? 'Cards' : 'Loyalty');
      setExpandedJourneyBar(null);
    }
  };

  const handleJourneyBarClick = (companyName) => {
    setExpandedJourneyBar(expandedJourneyBar === companyName ? null : companyName);
  };

  const renderJourneySection = () => {
    const getTrafficLight = (sos) => {
      if (sos >= 5.2) return RedLight;
      if (sos >= 4.6) return OrangeLight;
      return GreenLight;
    };

    const calculateStepSOS = (companyName, stepLabel) => {
      const stepOutcomes = top5Outcomes[companyName]?.[stepLabel] || [];
      if (stepOutcomes.length === 0) return 0;
      const total = stepOutcomes.reduce((sum, o) => sum + Number(o.SOS), 0);
      return total / stepOutcomes.length;
    };

    return (
      <div className="content-section">
        <div className="section-banner-row" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(90deg, #E40000 0%, #7E0000 100%)' }}>
          <div className="title-group">
            <div className="user-icon">
              <img src={OneCustomerIcon} alt="One Customer" />
            </div>
            <div className="section-title">
              {visibleJourney || journeySection.title}
            </div>
          </div>

          <div className="stage-banner">
            {journeySection.stages.map((stage, idx) => (
              <div key={idx} className="stage-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {typeof stage === 'string' ? stage : (
                  <>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>{stage.main}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{stage.sub}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="company-card">
          {journeySection.companies.filter(company => {
            if (selectedJourneyHierarchy === 'Loyalty') return company.name === 'Loyalty Journey';
            if (selectedJourneyHierarchy === 'Money') return company.name === 'Loyalty Journey' || company.name === 'Money Journey';
            return true;
          }).map((company, idx) => (
            <React.Fragment key={idx}>
              <div 
                className="company-row"
                onClick={() => handleJourneyBarClick(company.name)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                {company.options ? (
                  <div className="company-name" style={{ display: 'flex', flexDirection: 'column', width: '115px', paddingRight: '6px' }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        defaultValue={company.name}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#323232',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          outline: 'none',
                          width: '100%',
                          padding: '0',
                          paddingRight: '15px',
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          appearance: 'none',
                          WebkitAppearance: 'none'
                        }}
                      >
                        {company.options.map(opt => (
                          <option 
                            key={opt.value} 
                            value={opt.value} 
                            disabled={!opt.enabled}
                            style={{ color: opt.enabled ? '#333' : '#aaa' }}
                          >
                            {opt.value}
                          </option>
                        ))}
                      </select>
                      <span style={{ position: 'absolute', right: 0, top: '2px', fontSize: '10px', pointerEvents: 'none', color: '#666' }}>
                        ▼
                      </span>
                    </div>
                    {subtitles[company.name] && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#333', 
                        fontWeight: '400', 
                        marginTop: '4px', 
                        textTransform: 'none',
                        lineHeight: '1.2'
                      }}>
                        {subtitles[company.name]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="company-name" style={{ display: 'flex', flexDirection: 'column', width: '115px', paddingRight: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#323232' }}>{company.name}</span>
                      <span style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                        {expandedJourneyBar === company.name ? '▲' : '▼' }
                      </span>
                    </div>
                    {subtitles[company.name] && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#333', 
                        fontWeight: '400', 
                        marginTop: '4px', 
                        textTransform: 'none',
                        lineHeight: '1.2'
                      }}>
                        {subtitles[company.name]}
                      </div>
                    )}
                  </div>
                )}
                <div className="company-bar" style={{ 
                  height: company.name.includes('Loyalty') ? '36px' : 
                          company.name.includes('Money') ? '28px' : '20px' 
                }}>
                  {journeySection.stages.map((stageLabel, i) => {
                    const sos = calculateStepSOS(company.name, stageLabel);
                    return (
                      <div
                        key={i}
                        className="company-segment"
                        style={{ backgroundColor: company.color }}
                      >
                        <div className="traffic-light-pill" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 4px' }}>
                          {sos > 0 && <span style={{ color: 'white', fontSize: '10px', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{sos.toFixed(1)}</span>}
                        <img src={getTrafficLight(sos)} alt="status" style={{ width: '10px', height: '10px', visibility: 'hidden', position: 'absolute' }} />
                        <div style={{ 
                          width: '10px', height: '10px', borderRadius: '50%', 
                          backgroundColor: sos >= 5.2 ? '#E40000' : (sos >= 4.6 ? '#F5A623' : '#26A515'),
                          boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                        }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {expandedJourneyBar === company.name && (
                <div ref={(el) => setJourneyDetailRef(company.name, el)}>
                  <ExpandedJourneyDetail 
                    companyName={company.name} 
                    onInitiativeClick={(id) => handleNavigation('Opportunity', { initiativeId: id })}
                    onOutcomeClick={setSelectedOutcomeForReviews}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderIndexHierarchy = () => {
    return (
      <div className="content-section" style={{ paddingTop: 0 }}>
        <div className="index-hierarchy-container" style={{ 
          paddingTop: '20px', 
          paddingBottom: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '6px',
          fontFamily: 'system-ui, sans-serif'
        }}>
        {/* L1 */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.25)', 
          padding: '10px', 
          borderRadius: '8px', 
          color: '#FFFFFFE6', 
          fontWeight: '600', 
          fontSize: '10.4px',
          width: '98%',
          maxWidth: '1350px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          One Customer
        </div>
        
        {/* Combined L2, L3, L4 Hierarchy columns */}
        <div style={{ display: 'flex', gap: '8px', width: '98%', maxWidth: '1350px', justifyContent: 'center' }}>
          {[
            {
              label: 'Qantas Loyalty',
              children: [
                { parent: 'Account', children: ['For You', 'Trips', 'Profile'] },
                { parent: 'Travel', children: ['Flights', 'Hotels', 'Activities'] },
                { parent: 'Shop', children: ['Every day', 'Retail', 'Home'] },
                { parent: 'Money', children: ['Cards', 'Banking', 'Insurance'] }
              ]
            },
            {
              label: 'Qantas Airline',
              children: [
                { parent: 'Awareness', children: ['Discover', 'Explore', 'Plan'] },
                { parent: 'Purchase', children: ['Choose', 'Pay', 'Confirm'] },
                { parent: 'Fly', children: ['Airport', 'Flight', 'Arrival'] },
                { parent: 'Return', children: ['Support', 'Account', 'Relationship'] }
              ]
            }
          ].map((l2) => (
            <div key={l2.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
              {/* L2 Header */}
              <div 
                onClick={() => {
                  if (l2.label === 'Qantas Loyalty') {
                    setActiveView('One Customer');
                    setSelectedLifecycleRow('Loyalty');
                    setSelectedJourneyHierarchy('Loyalty');
                  } else {
                    setActiveView('Qantas');
                  }
                }}
                style={{ 
                  textAlign: 'center', 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  color: (l2.label === 'Qantas Loyalty' && selectedJourneyHierarchy === 'Loyalty') ? '#FFFFFFE6' : '#FFFFFFCC', 
                  fontWeight: '600', 
                  fontSize: '10.4px',
                  cursor: 'pointer'
                }}
              >
                {l2.label}
              </div>
              
              {/* L3 and L4 columns */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {l2.children.map((group) => (
                  <div key={group.parent} style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}>
                    {/* L3 */}
                    <div 
                      onClick={() => {
                        if (group.parent === 'Money') {
                          setActiveView('One Customer');
                          setSelectedLifecycleRow('Loyalty');
                          setSelectedJourneyHierarchy('Money');
                        }
                      }}
                      style={{ 
                        textAlign: 'center', 
                        backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                        padding: '10px 2px', 
                        borderRadius: '6px', 
                        color: (group.parent === 'Money' && ['Money', 'Cards'].includes(selectedJourneyHierarchy)) ? '#FFFFFFE6' : '#FFFFFFCC', 
                        fontWeight: '600', 
                        fontSize: '10.4px',
                        cursor: group.parent === 'Money' ? 'pointer' : 'default'
                      }}
                    >
                      {group.parent}
                    </div>
                    
                    {/* L4 */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {group.children.map((child) => (
                        <div 
                          key={child}
                          onClick={() => {
                            if (child === 'Cards') {
                              setActiveView('One Customer');
                              setSelectedLifecycleRow('Loyalty');
                              setSelectedJourneyHierarchy('Cards');
                            }
                          }} 
                          style={{ 
                            flex: 1,
                            textAlign: 'center', 
                            backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                            padding: '8px 2px', 
                            borderRadius: '4px', 
                            color: (child === 'Cards' && selectedJourneyHierarchy === 'Cards') ? '#FFFFFFE6' : '#FFFFFFCC', 
                            fontWeight: '600', 
                            fontSize: '9px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: child === 'Cards' ? 'pointer' : 'default'
                          }}
                        >
                          {child}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'Process':
        return <ProcessView />;
      case 'Qantas':
        return <QantasView />;
      case 'Opportunity':
        return <OpportunityView {...navProps} onOutcomeClick={setSelectedOutcomeForReviews} />;
      case 'One Customer':
      default:
        return (
          <>
            <RenderSection 
              section={lifecycleSection} 
              onRowSelect={handleRowSelect}
              selectedRow={selectedLifecycleRow}
              scoringData={top5Outcomes}
            />
            {selectedLifecycleRow === 'Loyalty' && renderJourneySection()}
            {renderIndexHierarchy()}
            <div className="extra-footer">Extra material</div>
            <div className="gray-footer">Footer material</div>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <div className="logo-placeholder">
            One Customer View
          </div>
        </div>

        <div className="top-nav">
          {navItems.map(item => {
            const isActive = item === 'Qantas Loyalty' 
              ? (selectedLifecycleRow === 'Loyalty' && activeView === 'One Customer')
              : item === 'One Customer'
                ? (!selectedLifecycleRow && activeView === 'One Customer')
                : activeView === item;

            return (
              <button
                key={item}
                className={`nav-pill ${isActive ? 'active' : ''}`}
                disabled={item === 'Qantas'}
                style={item === 'Qantas' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                onClick={() => {
                  if (item === 'Qantas Loyalty') {
                    handleNavigation('One Customer', { selectedLifecycleRow: 'Loyalty', selectedJourneyHierarchy: 'Loyalty' });
                  } else {
                    handleNavigation(item, item === 'One Customer' ? { selectedLifecycleRow: null, selectedJourneyHierarchy: 'Cards' } : {});
                  }
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </header>

      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
          <div className="sidebar-section">
            <div className="sidebar-title">Exploration</div>
            <div className="sidebar-item" onClick={() => setActiveView('Process')} style={{ cursor: 'pointer', fontWeight: activeView === 'Process' ? 'bold' : 'normal', color: activeView === 'Process' ? '#e40000' : 'inherit' }}>
              Process
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Teams</div>
            {journeyData.oneCustomer.companies.map(c => (
              <div key={c.id} className="sidebar-item">
                <div className="sidebar-badge" style={{ background: c.color }}></div> {c.name}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Channels</div>
            <div className="sidebar-item">Mobile App</div>
            <div className="sidebar-item">Web</div>
            <div className="sidebar-item">Contact Centre</div>
            <div className="sidebar-item">In-Person</div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Foundational Enablers</div>
            <div className="sidebar-item">Data & AI</div>
            <div className="sidebar-item">Personalisation</div>
            <div className="sidebar-item">Identity</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main-content" ref={mainContentRef}>
          {renderMainContent()}
        </div>
        
        <ReviewCarouselModal 
          isOpen={!!selectedOutcomeForReviews} 
          onClose={() => setSelectedOutcomeForReviews(null)} 
          outcomeText={selectedOutcomeForReviews} 
        />
      </div>
    </div>
  );
}

export default App;

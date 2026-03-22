import React, { useState } from 'react';
import journeys from '../data/aggregated_journeys.json';
import top5Outcomes from '../data/top5_outcomes_by_step.json';
import dummyInitiativesData from '../data/dummy_initiatives.json';

// Proof of concept transformations to simulate multi-layered Lx
const pocJourneys = [...journeys];

// Fix L2 display name (use Goal as subtitle)
const l2Index = pocJourneys.findIndex(j => j.Level === 'L2');
if (l2Index !== -1) {
    pocJourneys[l2Index] = {
        ...pocJourneys[l2Index],
        Journey_Name: 'Loyalty Journey'
    };
}

// Fix L1 name brevity
const l1Index = pocJourneys.findIndex(j => j.Level === 'L1');
if (l1Index !== -1) {
    pocJourneys[l1Index] = {
        ...pocJourneys[l1Index],
        Journey_Name: pocJourneys[l1Index].Journey_Name.replace('Aspirational ', '')
    };
}

const l4OptionsMap = {
    'Get rewards when I go somewhere: Travel with Qantas Loyalty': [
        "View Global Flight Radar Activity Hub",
        "Manage Online Flight Check-in Queue",
        "Track Realtime Baggage Claim Status",
        "Request Seat Upgrade Allocation Guides"
    ],
    'Get rewards when I buy something: Shop with Qantas Loyalty': [
        "Review Qantas Wine Loyalty Delivery Queue",
        "Configure Carbon Offset Tracking Widget",
        "Track Everyday Rewards Points Boosts",
        "Scan Vouchers for Retail Redemptions"
    ],
    'Get rewards with my finances: Money with Qantas Loyalty': [
        "Cards Journey (I want to earn rewards on my Credit Card spend)",
        "Banking Journey (I want to earn rewards on my banking)",
        "Insurance Journey (I want to earn rewards on my insurance policies)"
    ],
    'Manage my membership': [
        "View Status Credits Advancement Calculators",
        "Track Customer Support Response Ticket Timeline",
        "Manage Account Privacy and Password Resets",
        "Review Tier Benefits Updates and Expirations"
    ]
};

const QantasLoyaltyView = ({ onNavigate, onOutcomeClick }) => {
    // Keep an array of open layer indices (default to the first layer open)
    const [openLayers, setOpenLayers] = useState([0]);
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedL2Journey, setSelectedL2Journey] = useState('Loyalty Journey');
    const [selectedL3Journey, setSelectedL3Journey] = useState('Money Journey');
    const [selectedL4Journey, setSelectedL4Journey] = useState('Cards Journey');

    // state for nested grid rows collapse
    const [expandedDrivers, setExpandedDrivers] = useState({
        'Outcome 1': false,
        'Outcome 2': false,
        'Outcome 3': false,
        'Outcome 4': false,
        'Outcome 5': false
    });

    const toggleDriver = (driverName) => {
        setExpandedDrivers(prev => ({
            ...prev,
            [driverName]: !prev[driverName]
        }));
    };

    const filteredJourneys = selectedLevel === 'All' 
        ? pocJourneys 
        : pocJourneys.filter(j => j.Level === selectedLevel);

    const toggleLayer = (idx) => {
        if (openLayers.includes(idx)) {
            setOpenLayers(openLayers.filter(i => i !== idx));
        } else {
            setOpenLayers([...openLayers, idx]);
        }
    };

    const toggleAll = () => {
        if (openLayers.length === filteredJourneys.length) {
            setOpenLayers([]);
        } else {
            setOpenLayers(filteredJourneys.map((_, i) => i));
        }
    };

    // Card styling parameters matching Qantas View structurally but adjusting width generically
    const colWidth = 220;
    const colGap = 12;

    const renderLayer = (journey, idx) => {
        const isOpen = openLayers.includes(idx);
        const { Level, Journey_Name, Goal, Jobs } = journey;
        
        const totalCols = Jobs ? Jobs.length : 0;
        const totalWidth = totalCols * colWidth + (totalCols - 1) * colGap;

        const currentIsMockL2 = Level === 'L2' && selectedL2Journey === 'Go on a Trip: Fly with Qantas';
        const currentIsMockL3 = Level === 'L3' && selectedL3Journey !== 'Get rewards with my finances: Money with Qantas Loyalty';
        const currentIsMockL4 = Level === 'L4' && selectedL4Journey !== 'Cards Journey (I want to earn rewards on my Credit Card spend)';
        const isMockLayer = journey.isPlaceholder === true || currentIsMockL2 || currentIsMockL3 || currentIsMockL4;
        
        let displayName = Journey_Name;
        if (Level === 'L2') displayName = selectedL2Journey;
        if (Level === 'L3') displayName = selectedL3Journey;
        if (Level === 'L4') displayName = selectedL4Journey;

        const levelLabels = {
            'L1': 'Group',
            'L2': 'Brand',
            'L3': 'Product',
            'L4': 'Operational'
        };

        const currentL4Options = l4OptionsMap[selectedL3Journey] || [];

        return (
            <div key={idx} className="qv-section" style={{ marginBottom: '20px', border: '1px solid #d3dee6', borderRadius: '12px', backgroundColor: 'white', minWidth: 'min-content', overflow: 'visible' }}>
                {/* Accordion Header */}
                <div 
                    onClick={() => { if (!isMockLayer) toggleLayer(idx); }}
                    style={{ 
                        background: 'linear-gradient(90deg, #E40000 0%, #7E0000 100%)', 
                        color: 'white', 
                        padding: '15px 0', 
                        cursor: isMockLayer ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        opacity: isMockLayer ? 0.6 : 1,
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottomLeftRadius: (!isOpen && (isMockLayer || !Jobs || Jobs.length === 0)) ? '12px' : '0px',
                        borderBottomRightRadius: (!isOpen && (isMockLayer || !Jobs || Jobs.length === 0)) ? '12px' : '0px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, position: 'sticky', left: '20px' }}>
                        <div style={{ backgroundColor: 'white', color: '#e40000', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', opacity: isMockLayer ? 0.7 : 1 }}>
                            {levelLabels[Level] || Level}
                        </div>
                        
                        {Level === 'L2' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select 
                                    value={selectedL2Journey} 
                                    onClick={(e) => e.stopPropagation()} 
                                    onChange={(e) => setSelectedL2Journey(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        padding: 0
                                    }}
                                >
                                    <option value="Loyalty Journey" style={{ color: '#333' }}>Loyalty Journey</option>
                                </select>
                            </div>
                        ) : Level === 'L3' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select 
                                    value={selectedL3Journey || 'Money Journey'} 
                                    onClick={(e) => e.stopPropagation()} 
                                    onChange={(e) => {
                                        const newVal = e.target.value;
                                        setSelectedL3Journey(newVal);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        padding: 0
                                    }}
                                >
                                    <option value="Money Journey" style={{ color: '#333' }}>Money Journey</option>
                                </select>
                            </div>
                        ) : Level === 'L4' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select 
                                    value={selectedL4Journey} 
                                    onClick={(e) => e.stopPropagation()} 
                                    onChange={(e) => setSelectedL4Journey(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        padding: 0
                                    }}
                                >
                                    <option value="Cards Journey" style={{ color: '#333' }}>Cards Journey</option>
                                </select>
                            </div>
                        ) : (
                            displayName
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', right: '20px' }}>
                        {!isMockLayer && (
                            <div style={{ 
                                backgroundColor: 'white', 
                                color: '#e40000', 
                                padding: '4px 12px', 
                                borderRadius: '16px', 
                                fontSize: '13px', 
                                fontWeight: '800',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}>
                                SOS: {Jobs && Jobs.length > 0 ? Math.max(...Jobs.map(j => Number(j.Job_Average_SOS) || 0)).toFixed(1) : "0.0"}
                            </div>
                        )}
                        <div style={{ fontSize: '24px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{!isMockLayer && (isOpen ? '−' : '+')}</div>
                    </div>
                </div>

                {/* Collapsed Summary Track */}
                {!isOpen && !isMockLayer && Jobs && Jobs.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(90deg, #E40000 0%, #7E0000 100%)',
                        padding: '5px 20px 30px 20px',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ width: '120px', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
                            <span style={{ color: 'white' }}>Qantas Loyalty</span><br/>
                            {levelLabels[Level] || Level} Journey
                        </div>
                        <div style={{
                            display: 'flex',
                            flex: 1,
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            {Jobs.map((job, jIdx) => {
                                const isFirst = jIdx === 0;
                                const isLast = jIdx === Jobs.length - 1;
                                const sos = Number(job.Job_Average_SOS) || 0;
                                
                                let lightColor = '#148943';
                                let position = 'flex-end';
                                if (sos >= 10) { lightColor = '#e40000'; position = 'flex-start'; }
                                else if (sos >= 8) { lightColor = '#ff9900'; position = 'center'; }
                                
                                return (
                                    <div key={jIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            padding: '6px 8px',
                                            borderRadius: '8px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {job.ODI_Step}
                                        </div>
                                        <div style={{
                                            height: '24px',
                                            width: '100%',
                                            backgroundColor: '#C5A97C',
                                            borderTopLeftRadius: isFirst ? '12px' : '0px',
                                            borderBottomLeftRadius: isFirst ? '12px' : '0px',
                                            borderTopRightRadius: isLast ? '12px' : '0px',
                                            borderBottomRightRadius: isLast ? '12px' : '0px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: '15%',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '20px',
                                                height: '44px',
                                                backgroundColor: '#333',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: position,
                                                alignItems: 'center',
                                                padding: '4px 0',
                                                boxSizing: 'border-box',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)'
                                            }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    backgroundColor: lightColor,
                                                    boxShadow: `0 0 4px ${lightColor}`
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Collapsible Content Mapping */}
                {isOpen && !isMockLayer && (
                    <div style={{ padding: '0', background: 'linear-gradient(90deg, #E40000 0%, #7E0000 100%)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', overflow: 'hidden' }}>
                        <div className="qv-wide-container" style={{ minWidth: totalWidth + 240, padding: '20px' }}>
                            
                            {/* Row 1: ODI Step Headers */}
                            <div className="qv-header-row">
                                <div className="qv-sticky-label" style={{ background: '#e40000', paddingLeft: '20px', marginLeft: '-20px' }}>
                                    <div className="qv-title-group" style={{ height: '100%', alignItems: 'center', display: 'flex', color: 'white' }}>
                                        <div className="section-title">Stage</div>
                                    </div>
                                </div>
                                <div className="qv-columns-area">
                                    {Jobs.map((job, pIdx) => (
                                        <div
                                            key={pIdx}
                                            className="qv-stage-header"
                                            style={{ width: colWidth, backgroundColor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontSize: '14px', boxSizing: 'border-box', borderRadius: '12px' }}
                                        >
                                            {job.ODI_Step}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Row 2: Job Pills */}
                            <div className="qv-header-row" style={{ marginTop: '10px' }}>
                                <div className="qv-sticky-label" style={{ background: '#e40000', paddingLeft: '20px', marginLeft: '-20px' }}>
                                    <div className="qv-title-group" style={{ height: '100%', alignItems: 'center', display: 'flex', color: 'white' }}>
                                        <div className="section-title">Job to be Done</div>
                                    </div>
                                </div>
                                <div className="qv-columns-area">
                                    {Jobs.map((job, jIdx) => (
                                        <div
                                            key={jIdx}
                                            className="qv-pill"
                                            style={{ width: colWidth, backgroundColor: 'rgba(200, 50, 50, 0.85)', border: '1px solid rgba(255, 255, 255, 0.25)', color: 'white', padding: '12px 10px', fontSize: '14px', height: 'auto', minHeight: '40px', boxSizing: 'border-box', borderRadius: '20px' }}
                                        >
                                            {job.Job_Name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Analytical Grid Card */}
                            <div className="qv-grid-card" style={{ marginTop: '20px' }}>
                                

                                {/* ================== DYNAMIC OUTCOMES ================== */}
                                {[0, 1, 2, 3, 4].map(outcomeIndex => {
                                    const outcomeKey = `Outcome ${outcomeIndex + 1}`;
                                    const journeyName = journey.Journey_Name;
                                    // check if AT LEAST ONE job step has an outcome at this index
                                    const hasAnyData = Jobs.some(job => {
                                        const stepData = top5Outcomes[journeyName]?.[job.ODI_Step];
                                        return stepData && stepData[outcomeIndex];
                                    });
                                    if (!hasAnyData) return null;

                                    return (
                                        <React.Fragment key={outcomeKey}>
                                            <div className="qv-grid-row" onClick={() => toggleDriver(outcomeKey)} style={{ cursor: 'pointer', backgroundColor: '#f9f9f9', borderTop: '1px solid #eee' }}>
                                                <div className="qv-sticky-label qv-row-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}>
                                                    <span style={{ fontSize: '11px' }}>{expandedDrivers[outcomeKey] ? '▼' : '▶'}</span> Outcome ({outcomeIndex + 1})
                                                </div>
                                                <div className="qv-columns-area">
                                                    {Jobs.map((job, cIdx) => {
                                                        const outcome = top5Outcomes[journeyName]?.[job.ODI_Step]?.[outcomeIndex];
                                                        return (
                                                            <div key={cIdx} className="qv-cell" style={{ width: colWidth, boxSizing: 'border-box', fontSize: '13px', fontStyle: 'italic', color: '#111' }}>
                                                                {outcome ? (
                                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                                        <div style={{ marginTop: '5px', flexShrink: 0 }}>
                                                                            <span style={{ 
                                                                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', 
                                                                                backgroundColor: outcome.SOS >= 5.2 ? '#E40000' : (outcome.SOS >= 4.6 ? '#F5A623' : '#26A515'), 
                                                                                marginRight: '8px' 
                                                                            }}></span>
                                                                        </div>
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
                                                    <div className="qv-grid-row" style={{ backgroundColor: '#fffcfc' }}>
                                                        <div className="qv-sticky-label qv-row-label" style={{ paddingLeft: '35px', fontSize: '13px', color: '#555', fontStyle: 'italic' }}>Importance</div>
                                                        <div className="qv-columns-area">
                                                            {Jobs.map((job, cIdx) => {
                                                                const outcome = top5Outcomes[journeyName]?.[job.ODI_Step]?.[outcomeIndex];
                                                                return <div key={cIdx} className="qv-cell" style={{ width: colWidth, fontWeight: '700', boxSizing: 'border-box' }}>{outcome ? `${Number(outcome.Importance_Score).toFixed(1)} / 10` : '-'}</div>;
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="qv-grid-row" style={{ backgroundColor: '#fffcfc' }}>
                                                        <div className="qv-sticky-label qv-row-label" style={{ paddingLeft: '35px', fontSize: '13px', color: '#555', fontStyle: 'italic' }}>Satisfaction</div>
                                                        <div className="qv-columns-area">
                                                            {Jobs.map((job, cIdx) => {
                                                                const outcome = top5Outcomes[journeyName]?.[job.ODI_Step]?.[outcomeIndex];
                                                                return <div key={cIdx} className="qv-cell" style={{ width: colWidth, fontWeight: '700', boxSizing: 'border-box' }}>{outcome ? `${Number(outcome.Satisfaction_Score).toFixed(1)} / 10` : '-'}</div>;
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="qv-grid-row" style={{ backgroundColor: '#fffcfc' }}>
                                                        <div className="qv-sticky-label qv-row-label" style={{ paddingLeft: '35px', fontSize: '13px', color: '#555', fontStyle: 'italic' }}>SOS</div>
                                                        <div className="qv-columns-area">
                                                            {Jobs.map((job, cIdx) => {
                                                                const outcome = top5Outcomes[journeyName]?.[job.ODI_Step]?.[outcomeIndex];
                                                                if (!outcome) return <div key={cIdx} className="qv-cell" style={{ width: colWidth, color: '#ccc' }}>-</div>;
                                                                const sos = Number(outcome.SOS);
                                                                return (
                                                                    <div key={cIdx} className="qv-cell" style={{ width: colWidth, fontWeight: '800', color: sos > 10 ? '#e40000' : (sos >= 8 ? '#f39c12' : '#148943'), boxSizing: 'border-box' }}>
                                                                        {sos.toFixed(1)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {/* Other Bottom Rows */}
                                <div className="qv-grid-row" style={{ borderTop: '1px solid #eee' }}>
                                    <div className="qv-sticky-label qv-row-label">Emotional Experience</div>
                                    <div className="qv-columns-area">
                                        {Jobs.map((j, i) => {
                                            const quotes = [
                                                "\"I love Qantas. I do sometimes feel like something has been lost, though\"",
                                                "\"Comparing the cards is confusing. I just want to know which one gets me flights faster without massive fees.\"",
                                                "\"The application asked for details I had to hunt down. I wish it was more integrated with my Frequent Flyer profile.\"",
                                                "\"I was approved, but the card took two weeks to arrive and the digital wallet setup wasn't instant.\"",
                                                "\"I love seeing the points land in my account, but it's hard to track if I'm hitting my bonus spend tiers.\"",
                                                "\"When I had a dispute on a transaction, passing between the bank and Qantas support felt disconnected.\"",
                                                "\"Overall I am getting the points, but the ongoing value equation feels complex to manage.\""
                                            ];
                                            const activeQuote = quotes[i % quotes.length];
                                            return (
                                                <div key={i} className="qv-cell" style={{ width: colWidth, boxSizing: 'border-box' }}>
                                                    <div style={{
                                                        fontStyle: 'italic',
                                                        fontWeight: '500',
                                                        color: '#444',
                                                        backgroundColor: '#fdfdfd',
                                                        padding: '12px 14px',
                                                        borderRadius: '6px',
                                                        borderLeft: '4px solid #e2e8f0',
                                                        border: '1px solid #eee',
                                                        borderLeftWidth: '4px',
                                                        fontSize: '13px',
                                                        lineHeight: '1.4',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                    }}>
                                                        {activeQuote}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="qv-grid-row">
                                    <div className="qv-sticky-label qv-row-label">Metrics</div>
                                    <div className="qv-columns-area">
                                        {Jobs.map((j, i) => {
                                            const l1Data = [
                                                ["Perceptions of Qantas Brand", "Overall NPS: +45", "Brand Trust: 86%"],
                                                ["Value Perception: Good", "Brand Affinity: 78%", "NPS Momentum: +2"],
                                                ["Service Perception: 8.2/10", "NPS (Frequent): +52", "Brand Health: Strong"],
                                                ["Innovation Perception: 7.9/10", "NPS (Infrequent): +35", "Preference Rank: #1"],
                                                ["Reliability Perception: 8.5/10", "NPS Target: +50", "Brand Equity: High"]
                                            ];
                                            const l2Data = [
                                                ["Brand Awareness: 94%", "Categories Earned In: 1.2", "Whole of Market Survey: 82%"],
                                                ["Value Perception: 7.4/10", "Avg Pts Earned: 1,250", "Consideration: 76%"],
                                                ["Reward Appeal: 8.1", "Avg Pts Burned: 4,500", "Preference: 62%"],
                                                ["Program Value: 7.8/10", "Categories Earned In: 2.1", "Purchase Intent: 58%"],
                                                ["Loyalty Perception: 8.4", "Avg Pts Earned: 3,400", "Brand Loyalty: 74%"]
                                            ];
                                            const l3Data = [
                                                ["Overall CSAT: 82%", "Ease of Use (CSAT): 7.8", "Information CSAT: 85%"],
                                                ["Clarity (CSAT): 75%", "Understanding (CSAT): 7.2", "Helpfulness (CSAT): 80%"],
                                                ["Process CSAT: 78%", "Effort Score (CSAT): 4.1/5", "Frustration Level: Low"],
                                                ["Onboarding CSAT: 85%", "First Time Resolution: 92%", "Satisfaction (CSAT): 8.5"],
                                                ["Resolution CSAT: 88%", "Support CSAT: 89%", "Value Realization: 8.2"]
                                            ];
                                            const l4Data = [
                                                ["Page Views: 12.5k", "Bounce Rate: 48%", "Time on Page: 1m 12s"],
                                                ["Click-Through Rate: 8.2%", "Exit Rate: 34%", "Scroll Depth: 65%"],
                                                ["Form Starts: 3.2k", "Form Completion Rate: 41%", "Time to Complete: 3m 45s"],
                                                ["Conversion Rate: 12%", "Account Activations: 1.8k", "Error Rate: 2.1%"],
                                                ["Daily Active Users: 4.5k", "Avg Session Duration: 8m", "Abandonment Rate: 15%"]
                                            ];

                                            let metricsData = l4Data;
                                            if (Level === 'L1') metricsData = l1Data;
                                            if (Level === 'L2') metricsData = l2Data;
                                            if (Level === 'L3') metricsData = l3Data;

                                            const metricsList = metricsData[i % metricsData.length];
                                            return (
                                                <div key={i} className="qv-cell" style={{ width: colWidth, color: '#333', fontSize: '13px' }}>
                                                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
                                                        {metricsList.map((m, mIdx) => <li key={mIdx} style={{ marginBottom: '4px' }}>{m}</li>)}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Active Initiatives Row */}
                                <div className="qv-grid-row">
                                    <div className="qv-sticky-label qv-row-label">
                                        <div style={{ lineHeight: '1.2' }}>Initiatives</div>
                                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 'normal', marginTop: '4px' }}>
                                            (Addressing Step Outcomes)
                                        </div>
                                    </div>
                                    <div className="qv-columns-area">
                                        {Jobs.map((job, i) => {
                                            const stepOutcomes = top5Outcomes[journey.Journey_Name]?.[job.ODI_Step] || [];
                                            const stepOutcomeTexts = stepOutcomes.map(o => o.Customer_Outcome);
                                            
                                            const stepInits = dummyInitiativesData.filter(init => 
                                               init.outcomes.some(o => stepOutcomeTexts.includes(o))
                                            );

                                            return (
                                                <div key={i} className="qv-cell" style={{ width: colWidth, boxSizing: 'border-box' }}>
                                                    {stepInits.length === 0 ? <span style={{color: '#ccc', fontStyle:'italic', fontSize:'11px'}}>None active</span> : stepInits.map((init, iIdx) => (
                                                        <div key={iIdx} 
                                                            onClick={() => onNavigate && onNavigate('Opportunity', { initiativeId: init.id })}
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

                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '0 40px', minWidth: 'min-content', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '30px', marginTop: '20px', position: 'sticky', left: '40px', width: 'fit-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 700, color: '#333' }}>Hierarchy of Journeys</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f5f7f9', padding: '5px 12px', borderRadius: '8px', border: '1px solid #d3dee6' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Filter View:</span>
                        <select 
                            value={selectedLevel} 
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', fontWeight: 600, backgroundColor: 'white', cursor: 'pointer' }}
                        >
                            <option value="All">All Map Levels</option>
                            <option value="L1">Level 1: Group</option>
                            <option value="L2">Level 2: Brand</option>
                            <option value="L3">Level 3: Product</option>
                            <option value="L4">Level 4: Operational</option>
                        </select>
                    </div>
                </div>
                <button 
                    onClick={toggleAll}
                    style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                    {openLayers.length === filteredJourneys.length ? 'Collapse All' : 'Expand All'}
                </button>
            </div>
            
            {filteredJourneys.map((journey, idx) => renderLayer(journey, idx))}

        </div>
    );
};

export default QantasLoyaltyView;

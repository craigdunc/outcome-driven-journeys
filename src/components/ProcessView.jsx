import React, { useState, useMemo } from 'react';
import './ProcessView.css';
import rawReviewsData from '../data/raw_reviews.json';
import customerOutcomesData from '../data/customer_outcomes.json';
import scoredOutcomesData from '../data/customer_outcomes_scored.json';

const ProcessView = () => {
  const [activeTab, setActiveTab] = useState('harvesting');
  const [selectedJourneyFilter, setSelectedJourneyFilter] = useState('All');
  
  const filteredReviews = useMemo(() => {
    if (selectedJourneyFilter === 'All') return rawReviewsData;
    return rawReviewsData.filter(r => r.Journey_Name === selectedJourneyFilter);
  }, [selectedJourneyFilter]);

  const filteredOutcomes = useMemo(() => {
    if (selectedJourneyFilter === 'All') return customerOutcomesData;
    return customerOutcomesData.filter(r => r.Journey_Name === selectedJourneyFilter);
  }, [selectedJourneyFilter]);

  const filteredScoredOutcomes = useMemo(() => {
    let data = scoredOutcomesData;
    if (selectedJourneyFilter !== 'All') {
      data = data.filter(r => r.Journey_Name === selectedJourneyFilter);
    }
    const uniqueMap = new Map();
    data.forEach(item => {
      if (!uniqueMap.has(item.Customer_Outcome)) {
        uniqueMap.set(item.Customer_Outcome, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [selectedJourneyFilter]);
  

  return (
    <div className="process-view-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#111' }}>The JTBD Generation Process</h1>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
        <strong>Outcome Driven Journeys</strong><br />
        Outcome Driven Innovation is one of the most rigorous frameworks for understanding customer needs — but its traditional form requires extensive upfront research: hundreds of interviews, expert facilitation, and significant time and cost before any insight is produced. For many organisations, that barrier means it never gets started.
      </p>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
        Outcome Driven Journeys is a multiple-layer journey approach that removes that barrier. Rather than waiting for primary research, it uses the conversations customers are already having — forum posts, reviews, community discussions — to construct a full ODI-style architecture from day one. Customer Outcomes are derived systematically from this data, structured into journey steps, classified by metric type, and scored for importance and satisfaction to surface genuine service opportunities.
      </p>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
        This produces something organisations can act on immediately. And because the architecture is built to accommodate additional data, primary research doesn't disappear from the process — it joins it. Interview and survey data can supplement and refine the forum-sourced foundation over time, progressively improving fidelity without requiring it upfront.
      </p>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>
        The output is a living, evidence-based view of what customers are trying to achieve, where they are underserved, and where the greatest opportunities for innovation lie.
      </p>

      <div className="process-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        {['harvesting', 'ai-derivation', 'scoring'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: activeTab === tab ? '700' : '500',
              backgroundColor: activeTab === tab ? '#e40000' : 'transparent',
              color: activeTab === tab ? '#fff' : '#444',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'harvesting' && (
        <div className="process-section fade-in">
          <h2>1. Data Collection & Harvesting</h2>
          <p>We utilized Deep Research to securely source highly targeted, authentic customer quotes across all key Job Stages for our three core Journeys. <b>Ensure zero synthetic data is used.</b></p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {['All', 'Loyalty Journey', 'Money Journey', 'Cards Journey'].map(journey => (
              <button
                key={journey}
                onClick={() => setSelectedJourneyFilter(journey)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: selectedJourneyFilter === journey ? 'bold' : 'normal',
                  backgroundColor: selectedJourneyFilter === journey ? '#e40000' : '#f8f8f8',
                  color: selectedJourneyFilter === journey ? '#fff' : '#333',
                  border: selectedJourneyFilter === journey ? '1px solid #e40000' : '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {journey}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Showing {filteredReviews.length} {selectedJourneyFilter !== 'All' ? `quotes for ${selectedJourneyFilter}` : 'total quotes in database'}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', padding: '15px' }}>
            {filteredReviews.length > 0 ? filteredReviews.map((review, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '12px', borderRadius: '8px', borderLeft: '4px solid #e40000', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <span style={{ backgroundColor: '#f1f1f1', padding: '4px 8px', borderRadius: '4px' }}>{review.Journey_Name}</span>
                  <span style={{ backgroundColor: '#e2f0fe', color: '#0366d6', padding: '4px 8px', borderRadius: '4px' }}>Step {review.Job_Step}: {review.Job_Step_Label}</span>
                  <span style={{ backgroundColor: '#e6ffed', color: '#22863a', padding: '4px 8px', borderRadius: '4px' }}>{review.Source || 'Unknown'}</span>
                </div>
                <div style={{ fontSize: '15px', color: '#222', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{review.Review_Body}"
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No reviews found for this filter.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai-derivation' && (
        <div className="process-section fade-in">
          <h2>2. AI Derivation (Outcomes)</h2>
          <div style={{ lineHeight: '1.6', color: '#444', marginBottom: '30px' }}>
            <p style={{ marginBottom: '15px' }}>
              The process starts with raw, unstructured customer voice — forum posts and reviews from people talking about loyalty programmes, credit cards, and reward flights. These are messy, conversational, and full of noise.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0052cc' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#0052cc' }}>Task 1: Structural</h3>
                <p style={{ fontSize: '13px' }}>Each review is assigned to a step in the customer journey (Locate, Prepare, Execute, Monitor, Modify, Conclude), grounding raw sentiment in its experience context.</p>
              </div>
              <div style={{ backgroundColor: '#fff8eb', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff9900' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#ff9900' }}>Task 2: Classification</h3>
                <p style={{ fontSize: '13px' }}>Reviews are classified against three domain-specific metrics: <b>Effort</b> (friction), <b>Value</b> (ROI), and <b>Relevance</b> (personal applicability).</p>
              </div>
              <div style={{ backgroundColor: '#e6ffed', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#28a745' }}>Task 3: Synthesis</h3>
                <p style={{ fontSize: '13px' }}>Each classified review is transformed into a structured Customer Outcome statement: <span style={{ color: '#000' }}>Direction + Metric + Object of Control + Contextual Clarifier</span>.</p>
              </div>
            </div>

            <p style={{ marginBottom: '20px' }}>
              The result is that each raw review becomes a structured, comparable outcome — one that can be counted, clustered, and ultimately prioritised by frequency and sentiment to identify where the real service opportunities lie.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['All', 'Loyalty Journey', 'Money Journey', 'Cards Journey'].map(journey => (
              <button
                key={journey}
                onClick={() => setSelectedJourneyFilter(journey)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: selectedJourneyFilter === journey ? 'bold' : 'normal',
                  backgroundColor: selectedJourneyFilter === journey ? '#e40000' : '#f8f8f8',
                  color: selectedJourneyFilter === journey ? '#fff' : '#333',
                  border: selectedJourneyFilter === journey ? '1px solid #e40000' : '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {journey}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', padding: '15px' }}>
            {filteredOutcomes.length > 0 ? filteredOutcomes.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '16px', borderRadius: '8px', borderLeft: '4px solid #0052cc', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '0.5px' }}>
                  <span style={{ backgroundColor: '#f1f1f1', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{item.Journey_Name}</span>
                  <span style={{ backgroundColor: '#e2f0fe', color: '#0366d6', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{item.Job_Step_Label}</span>
                  <span style={{ backgroundColor: '#fff8eb', color: '#ff9900', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Metric: {item.Metric_Measure}</span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Raw Review</div>
                  <div style={{ fontSize: '13px', color: '#555', fontStyle: 'italic', borderLeft: '2px solid #ddd', paddingLeft: '10px' }}>"{item.Raw_Review}"</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Object of Control</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{item.Object_of_Control}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Contextual Clarifier</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{item.Contextual_Clarifier}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Structured Outcome</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0052cc' }}>{item.Customer_Outcome}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No outcomes found for this filter.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scoring' && (
        <div className="process-section fade-in">
          <h2>3. Opportunity Scoring (ODI)</h2>
          <div style={{ lineHeight: '1.6', color: '#444', marginBottom: '30px' }}>
            <p style={{ marginBottom: '15px' }}>
              The scoring follows the ODI framework from the paper, applied in three modular steps to ensure statistical rigour.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #6c757d' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>Step 1: Sentiment Classification</h3>
                <p style={{ fontSize: '13px' }}>Sentiment is run on every raw review, assigning <b>Positive</b>, <b>Negative</b>, or <b>Neutral</b>. This is done at the individual review level to capture the raw emotional signal before aggregation.</p>
              </div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #6c757d' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>Step 2: Aggregation</h3>
                <p style={{ fontSize: '13px' }}>Reviews mapping to the same Outcome are grouped to yield three numbers: <b>Total Frequency</b>, <b>Positive Count</b>, and <b>Negative Count</b>.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #d0d7de' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#0052cc' }}>Step 3: Score Derivation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', marginBottom: '5px' }}>Importance (0-10)</h4>
                  <p style={{ fontSize: '12px' }}>Calculated using <b>k-means clustering</b> on frequency. Outcomes are grouped into 11 clusters to prevent a few high-volume outliers from distorting the scale.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', marginBottom: '5px' }}>Satisfaction (0-10)</h4>
                  <p style={{ fontSize: '12px' }}>Formula: <code style={{ backgroundColor: '#e1e8ed', padding: '2px 4px' }}>5 × ((pos - neg) / total) + 5</code>. A perfect positive mix scores 10; a perfect negative mix scores 0.</p>
                </div>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #d0d7de' }}>
                <h4 style={{ fontSize: '13px', marginBottom: '5px', color: '#e40000' }}>Service Opportunity Score (SOS)</h4>
                <p style={{ fontSize: '12px' }}>Formula: <code style={{ backgroundColor: '#ffeef0', padding: '2px 4px', color: '#e40000' }}>Importance + max(Importance - Satisfaction, 0)</code>. Uplift only occurs when importance exceeds satisfaction, flagging high-priority gaps.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['All', 'Loyalty Journey', 'Money Journey', 'Cards Journey'].map(journey => (
              <button
                key={journey}
                onClick={() => setSelectedJourneyFilter(journey)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: selectedJourneyFilter === journey ? 'bold' : 'normal',
                  backgroundColor: selectedJourneyFilter === journey ? '#e40000' : '#f8f8f8',
                  color: selectedJourneyFilter === journey ? '#fff' : '#333',
                  border: selectedJourneyFilter === journey ? '1px solid #e40000' : '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {journey}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', padding: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: '0', backgroundColor: '#f8f9fa', zIndex: '10' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #dee2e6' }}>Outcome Description</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #dee2e6', width: '80px' }}>Freq</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #dee2e6', width: '80px' }}>Imp</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #dee2e6', width: '80px' }}>Sat</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #dee2e6', width: '80px' }}>SOS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScoredOutcomes.length > 0 ? filteredScoredOutcomes.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: item.High_Opportunity === "True" || item.High_Opportunity === true ? '#fff5f5' : 'transparent' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#0052cc', marginBottom: '4px' }}>{item.Customer_Outcome}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.Journey_Name} • {item.Job_Step_Label}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: '500' }}>{item.Occurrence_Frequency}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: '700' }}>{Number(item.Importance_Score).toFixed(1)}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: '700' }}>{Number(item.Satisfaction_Score).toFixed(1)}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ 
                        backgroundColor: (item.SOS >= 10) ? '#e40000' : (item.SOS >= 7) ? '#ff9900' : '#f1f1f1',
                        color: (item.SOS >= 7) ? '#fff' : '#333',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {Number(item.SOS).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No scored outcomes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProcessView;

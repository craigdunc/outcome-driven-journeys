import React, { useState, useEffect } from 'react';
import outcomesData from '../data/customer_outcomes_scored.json';

const ReviewCarouselModal = ({ isOpen, onClose, outcomeText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [outcomeText]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !outcomeText) return null;

  const reviews = outcomesData.filter(d => d.Customer_Outcome === outcomeText);

  if (reviews.length === 0) {
     return null;
  }

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % reviews.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);

  const currentReview = reviews[currentIndex];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={onClose}>
      <div 
        style={{
          width: '600px', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#fdfdfd' }}>
           <div style={{ flex: 1, paddingRight: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#e40000', marginBottom: '6px' }}>Source Feedback for Outcome</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', lineHeight: '1.4' }}>"{outcomeText}"</div>
           </div>
           <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999', padding: '0 4px', lineHeight: '1' }}>&times;</button>
        </div>

        {/* Carousel Body */}
        <div style={{ padding: '40px 40px', position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {reviews.length > 1 && (
            <button 
              onClick={handlePrev} 
              style={{ position: 'absolute', left: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155', fontWeight: 'bold' }}
            >
              &larr;
            </button>
          )}

          <div style={{ flex: 1, padding: '0 20px', textAlign: 'center' }}>
             <div style={{ fontSize: '36px', color: '#cbd5e1', fontFamily: 'serif', lineHeight: '0', position: 'relative', top: '10px' }}>&ldquo;</div>
             <div style={{ fontSize: '18px', color: '#111', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '24px' }}>
               {currentReview.Raw_Review || "No qualitative feedback recorded for this outcome."}
             </div>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Source:</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{currentReview.Source || "Unknown"}</span>
             </div>
          </div>

          {reviews.length > 1 && (
            <button 
              onClick={handleNext} 
              style={{ position: 'absolute', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155', fontWeight: 'bold' }}
            >
              &rarr;
            </button>
          )}

        </div>

        {/* Footer Dots / Counter */}
        {reviews.length > 1 && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: '80%' }}>
                {reviews.map((_, idx) => (
                <div key={idx} style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    backgroundColor: idx === currentIndex ? '#e40000' : '#cbd5e1',
                    transition: 'background-color 0.2s', cursor: 'pointer'
                }} onClick={() => setCurrentIndex(idx)} />
                ))}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>
                Review {currentIndex + 1} of {reviews.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCarouselModal;

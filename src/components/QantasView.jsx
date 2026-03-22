import React from 'react';
import { journeyData } from '../data/journeyData';
import OneCustomerIcon from '../assets/icons/One Customer.svg';

const QantasView = () => {
    const { qantas } = journeyData;
    const { colWidth, colGap } = qantas;

    const renderSection = (section) => {
        // Flatten all sub-stages
        const allSubStages = section.phases.flatMap(p => p.subStages);
        const totalCols = allSubStages.length;
        const totalWidth = totalCols * colWidth + (totalCols - 1) * colGap;

        return (
            <div className="qv-section">
                <div className="qv-wide-container" style={{ minWidth: totalWidth + 120 }}>

                    {/* Row 1: Icon + Title + Stage Headers */}
                    <div className="qv-header-row">
                        <div className="qv-sticky-label">
                            <div className="qv-title-group">
                                <div className="user-icon">
                                    <img src={OneCustomerIcon} alt="Qantas" />
                                </div>
                                <div className="section-title">{section.title}</div>
                            </div>
                        </div>
                        <div className="qv-columns-area">
                            {section.phases.map((phase, pIdx) => {
                                const spanCols = phase.subStages.length;
                                const phaseWidth = spanCols * colWidth + (spanCols - 1) * colGap;
                                return (
                                    <div
                                        key={pIdx}
                                        className="qv-stage-header"
                                        style={{ width: phaseWidth }}
                                    >
                                        {phase.name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Row 2: Sub-stage Pills */}
                    <div className="qv-header-row">
                        <div className="qv-sticky-label" />
                        <div className="qv-columns-area">
                            {allSubStages.map((sub, idx) => (
                                <div
                                    key={idx}
                                    className="qv-pill"
                                    style={{ width: colWidth }}
                                >
                                    {sub}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Card */}
                    <div className="qv-grid-card">
                        {section.gridRows.map((rowLabel, rowIdx) => (
                            <div key={rowIdx} className="qv-grid-row">
                                <div className="qv-sticky-label qv-row-label">{rowLabel}</div>
                                <div className="qv-columns-area">
                                    {allSubStages.map((_, colIdx) => (
                                        <div
                                            key={colIdx}
                                            className="qv-cell"
                                            style={{ width: colWidth }}
                                        >
                                            {section.gridData[rowIdx]?.[colIdx] || ''}
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

    return (
        <>
            {renderSection(qantas.lifecycle)}
            {renderSection(qantas.journey)}
            <div className="extra-footer" style={{ minWidth: 'fit-content' }}>Extra material</div>
            <div className="gray-footer" style={{ minWidth: 'fit-content' }}>Footer material</div>
        </>
    );
};

export default QantasView;

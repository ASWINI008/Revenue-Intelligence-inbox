import React, { useState } from 'react';
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  PRESENTATION_SLIDES,
  downloadPowerPointPresentation,
} from '../services/pptxService';

export default function PresentationView() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];

  const handleDownloadPPTX = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadPowerPointPresentation();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to download PPTX:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="presentation-view">
      {/* Top Console Banner */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <Presentation size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Executive Briefing Deck &bull; 5 Essential Slides</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Structured executive review covering revenue operations, traceable ground truth findings, conflict routing case study, and architectural decisions.
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-forest btn-sm shadow-none"
              disabled={isDownloading}
              onClick={handleDownloadPPTX}
            >
              <Download size={13} />
              <span>{isDownloading ? 'Generating...' : 'Download PowerPoint (.pptx)'}</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="alert alert-success py-1.5 px-3 small mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
          <CheckCircle size={14} className="text-success" />
          <span>Presentation downloaded as <strong>revenue_intelligence_presentation.pptx</strong>.</span>
        </div>
      )}

      {/* Slide Navigation Strip */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-1.5">
          {PRESENTATION_SLIDES.map((slide, idx) => (
            <button
              key={slide.slideNumber}
              type="button"
              className={`btn btn-sm py-1 px-2.5 ${
                currentSlideIndex === idx ? 'btn-forest' : 'btn-editorial-outline'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setCurrentSlideIndex(idx)}
            >
              Slide {slide.slideNumber}
            </button>
          ))}
        </div>

        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-editorial-outline btn-sm py-1 px-2"
            disabled={currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-muted small px-2" style={{ fontSize: '0.75rem' }}>
            {currentSlideIndex + 1} / {PRESENTATION_SLIDES.length}
          </span>
          <button
            type="button"
            className="btn btn-editorial-outline btn-sm py-1 px-2"
            disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
            onClick={() => setCurrentSlideIndex((i) => Math.min(PRESENTATION_SLIDES.length - 1, i + 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="console-card">
        {/* Slide Header */}
        <div className="p-3 bg-surface border-bottom border-2" style={{ borderBottomColor: 'var(--accent-forest)' }}>
          <div className="font-mono text-muted small mb-0.5" style={{ fontSize: '0.7rem' }}>
            SLIDE {currentSlide.slideNumber} OF 5 &bull; VOLOPAY EXECUTIVE BRIEF
          </div>
          <h4 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            {currentSlide.title}
          </h4>
          <div className="text-secondary small fst-italic" style={{ fontSize: '0.8rem' }}>
            {currentSlide.subtitle}
          </div>
        </div>

        {/* Slide Bullets */}
        <div className="p-3" style={{ backgroundColor: 'var(--bg-app)' }}>
          <div className="row g-2">
            {currentSlide.bullets.map((bullet, bIdx) => (
              <div key={bIdx} className="col-12 col-md-6">
                <div className="p-3 bg-white border rounded h-100 border-start border-3" style={{ borderLeftColor: 'var(--accent-forest)' }}>
                  <div className="fw-bold text-dark small mb-1" style={{ fontSize: '0.82rem' }}>
                    {bIdx + 1}. {bullet.heading}
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                    {bullet.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 bg-surface border-top d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.72rem' }}>
          <span>Grounded in canonical dataset records without fabrication</span>
          <span className="font-mono">PptxGenJS RFC Engine</span>
        </div>
      </div>
    </div>
  );
}

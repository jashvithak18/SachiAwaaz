import React from 'react';

export default function BackgroundEffects() {
  return (
    <>
      {/* Drifting Organic Blobs */}
      <div className="blob-container">
        <div className="organic-blob blob-1"></div>
        <div className="organic-blob blob-2"></div>
        <div className="organic-blob blob-3"></div>
      </div>

      {/* Tiny Floating Particles */}
      <div className="particle-container">
        <div className="floating-particle p-1"></div>
        <div className="floating-particle p-2"></div>
        <div className="floating-particle p-3"></div>
        <div className="floating-particle p-4"></div>
        <div className="floating-particle p-5"></div>
        <div className="floating-particle p-6"></div>
      </div>
    </>
  );
}

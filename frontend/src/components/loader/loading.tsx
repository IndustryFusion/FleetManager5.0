import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import dynamic from 'next/dynamic';
import "../../../public/styles/loading-screen.css"

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-screen-wrapper">
        <div className="loading-screen-content">
          <ProgressBar 
            mode="indeterminate" 
            className="black-progress-bar custom-progress-bar"
          />
          <div className="loading-text-container">
            <p className="loading-title">Loading...</p>
            <p className="loading-subtitle">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LoadingScreen), {
  ssr: false
});
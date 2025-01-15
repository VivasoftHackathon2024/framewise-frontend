import React from 'react';

const spinnerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%'
};

const spinnerStyle = {
  border: '4px solid rgba(0, 0, 0, 0.1)',
  borderLeft: '4px solid #3498db',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite'
};

const keyframesStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Spinner = () => {
  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle}></div>
      </div>
    </>
  );
};

export default Spinner; 
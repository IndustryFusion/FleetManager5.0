import React from 'react';

interface RealtimeParametersProps {
  optionsArray: string[]
}
const RealtimeParameters: React.FC<RealtimeParametersProps> = ({ optionsArray }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: "repeat(3, 1fr)",
      gridAutoRows: "auto",
      gap: '10px', 
      border: "1px solid #ced4da",
      padding: "16px 24px",
      borderRadius: "10px"
    }}>
      {optionsArray.length === 0 ? "No Realtime Parameters" :
        optionsArray.map((option, index) => (
          <div key={index}  >
            <div>{option}</div>
          </div>
        ))}
    </div>
  );
};

export default RealtimeParameters;

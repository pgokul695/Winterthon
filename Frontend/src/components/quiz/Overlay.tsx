import React from "react";
import ReactDOM from "react-dom";

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const overlayContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%)'
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  // Render as portal to ensure it's not affected by parent container
  return ReactDOM.createPortal(
    overlayContent,
    document.body
  );
};

export default Overlay;

import React from 'react';

const Home = () => {
  const handleStart = () => {
    console.log("Start button clicked or tapped");
    // Future camera streaming functionality can be triggered here
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative flex justify-center items-center">
      <button
        onClick={handleStart}
        className="
          bg-white/30 text-white text-xl font-bold 
          py-4 px-10 rounded-full opacity-90 
          hover:opacity-100 transition-opacity 
          active:bg-white/50 active:scale-95
          absolute bottom-[25%] touch-auto cursor-pointer
        "
        style={{ touchAction: 'manipulation', pointerEvents: 'auto' }} // Ensures smooth interaction on touch devices
      >
        CLICK TO START
      </button>
    </div>
  );
};

export default Home;
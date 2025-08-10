import React from 'react';
import { LightingCalculator } from './components/LightingCalculator';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <LightingCalculator />
      <Toaster />
    </div>
  );
}

export default App;

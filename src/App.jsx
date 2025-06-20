import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Timeline from './pages/Timeline';
import Event from './pages/Event';
import Activity from './pages/Activity';
import Charts from './pages/Charts';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/activity/:id" element={<Activity />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
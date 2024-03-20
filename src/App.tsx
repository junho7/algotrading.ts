import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./main.css";
import Backtest from "./backtest";
import LoadHistoricalData from "./historicaldata";

const App = () => {
  return (
    <Router>
      <div className="main">
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/backtest">Backtest</Link>
            </li>
            <li>
              <Link to="/historicaldata">Save [Data DataProvider -{'>'} DB]</Link>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/historicaldata" element={<LoadHistoricalData />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

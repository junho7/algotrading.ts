import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./main.css";
import Backtest from "./backtest";
import HistoricalData from "./historicaldata";

const App = () => {
  return (
    <Router>
      <div className="main">
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Home (Chart)</Link>
            </li>
            <li>
              <Link to="/backtest">Backtest</Link>
            </li>
            <li>
              <Link to="/historicaldata">HistoricalData</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="content">
          <Routes>
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/historicaldata" element={<HistoricalData />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Render your Main component into the DOM
// ReactDOM.render(<Main />, document.getElementById("root"));

export default App;

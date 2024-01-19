import "./App.css";
import React from "react";
import HomePage from "./components/HomePage";
import MuseumPage from "./components/Art/MuseumPage";
import PolyglotPage from "./components/Polyglot/PolyglotPage";
import Navigation from "./components/Navigation";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PopChoicePage from "./components/PopChoice/PopChoicePage";
import AssistantsPage from "./components/Assistants/AssistantsPage";

const App = () => {
  return (
    <Router>
      <div>
        <header>
          <Navigation />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/museum" element={<MuseumPage />} />
            <Route path="/polyglot" element={<PolyglotPage />} />
            <Route path="/popchoice" element={<PopChoicePage />} />
            <Route path="/assistants" element={<AssistantsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

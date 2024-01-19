import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav>
      <li>
        <Link to="/museum">Museum</Link>
      </li>
      <li>
        <Link to="/polyglot">Polyglot</Link>
      </li>
      <li>
        <Link to="/popchoice">PopChoice</Link>
      </li>
      <li>
        <Link to="/assistants">Assistants</Link>
      </li>
    </nav>
  );
};

export default Navigation;

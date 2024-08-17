import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import "typeface-roboto";
import "typeface-roboto-condensed";
import "typeface-roboto-slab";
import "typeface-poppins";
import "typeface-exo";
import "typeface-lora";
import "typeface-barlow";
import "typeface-open-sans";
import "typeface-lato";
import "typeface-merriweather";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

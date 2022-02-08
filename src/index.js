import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppWithoutRelay from "./AppWithoutRelay";
import AppWithRelay from "./AppWithRelay";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter basename="/idchain-registration-simple">
            <Routes>
                <Route path="/" element={<AppWithoutRelay />} />
                <Route path="/gasless" element={<AppWithRelay />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

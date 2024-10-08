import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

async function deferRender() {
  const { worker } = await import("./mocks/browser");
  return worker.start();
}

deferRender().then(() => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});

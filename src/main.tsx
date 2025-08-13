import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { enableMapSet } from "immer";
import App from "./App.tsx";

// Enable Map & Set support for Immer
enableMapSet();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

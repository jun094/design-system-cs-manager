import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";

import App from "./App.tsx";

import "@radix-ui/themes/styles.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Theme accentColor="mint" radius="large" scaling="95%">
			<App />
		</Theme>
	</StrictMode>
);

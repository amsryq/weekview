import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="flex justify-center items-center w-screen">
			<Button onClick={() => setCount((count) => count + 1)}>
				The count is {count}
			</Button>
		</div>
	);
}

export default App;

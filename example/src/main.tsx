import { createRoot } from 'react-dom';

const comp = (
	<div>
		<a>hello world</a>
	</div>
);
console.log(comp);
const renderer = createRoot(document.getElementById('root'));
renderer.render(comp);

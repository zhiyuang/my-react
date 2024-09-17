import { createRoot } from 'react-dom';
import App from './App';

// const comp = (
// 	<div>
// 		<a>hello world</a>
// 	</div>
// );
// console.log(comp);
const renderer = createRoot(document.getElementById('root'));
renderer.render(App);

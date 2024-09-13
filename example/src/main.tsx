import {createRoot} from 'react-dom'


const comp = <div>hello world</div>
console.log(comp)
const renderer = createRoot(document.getElementById("root"));
renderer.render();


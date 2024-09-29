import { useState } from 'react';

// 单节点+事件
// let n = 0;
// function App() {
//   const [name, setName] = useState(() => false)
//   const [age, setAge] = useState(() => 10)
//   if (n === 0) {
//       const tid = setTimeout(() => {
//           n++
//           setName(true)
//           setAge(11)
//           clearTimeout((tid))
//       }, 1000)
//   }

//   return name ? <Comp>{name + age}</Comp> : 'N/A'
// }

// function Comp({children}) {
//   return (
//     <span onClick={() => console.log(99999)}>
//       <i>{`Hello world, ${children}`}</i>
//     </span>
//   )
// }

function App() {
	const [num, updateNum] = useState(0);

	const isOdd = num % 2;

	const before = [
		<li key={1}>1</li>,
		<li>2</li>,
		<li>3</li>,
		<li key={4}>4</li>
	];
	const after = [
		<li key={4}>4</li>,
		<li>2</li>,
		<li>3</li>,
		<li key={1}>1</li>
	];

	const listToUse = isOdd ? before : after;

	return (
		<ul
			onClick={(e) => {
				updateNum(num + 1);
			}}
		>
			{listToUse}
		</ul>
	);
}

export default App;

import { useState } from "react"


let n = 0

function App() {
  const [name, setName] = useState(() => false)
  const [age, setAge] = useState(() => 10)
  if (n === 0) {
      const tid = setTimeout(() => {
          n++
          setName(true)
          setAge(11)
          clearTimeout((tid))
      }, 1000)
  }

  return name ? <Comp>{name + age}</Comp> : 'N/A'
}

function Comp({children}) {
  return (
    <span onClick={() => console.log(99999)}>
      <i>{`Hello world, ${children}`}</i>
    </span>
  )
}

export default App

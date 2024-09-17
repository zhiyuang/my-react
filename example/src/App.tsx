import { useState } from "react"

function App() {
  return (
    <div>
      <Comp>{name}</Comp>
    </div>
  )
}

function Comp({children}) {
  const [name, setName] = useState('hello')
  return (
    <span>
      <i>{`Hello world, ${name}`}</i>
    </span>
  )
}

export default App

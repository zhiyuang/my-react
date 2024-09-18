import { useState } from "react"

function App() {
  const [name, setName] = useState('hello')
  return (
    <div>
      <Comp>{name}</Comp>
    </div>
  )
}

function Comp({children}) {
  return (
    <span>
      <i>{`Hello world, ${children}`}</i>
    </span>
  )
}

export default App

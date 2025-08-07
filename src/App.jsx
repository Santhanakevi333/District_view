import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TamilNaduMap from './components/TamilNaduMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
     <h1 className='text-center text-green-500 text-2xl font-bold mt-4'>Tamil Nadu District Map View</h1>
     <TamilNaduMap/>
    </div>
  )
}

export default App;
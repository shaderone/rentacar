import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className='container mx-auto'>
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </div>
    </Router>
  );
}

export default App;
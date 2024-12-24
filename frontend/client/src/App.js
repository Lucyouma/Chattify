import React from 'react'; // Import React
import Chat from './components/Chat'; // Import Chat component
import './App.css'; // Import CSS

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Chattify!</h1>
        <p>Your One-Stop Solution For Seamless Communication.</p>
      </header>
      {/* Add Chat Component Below */}
      <Chat />
    </div>
  );
}

export default App;

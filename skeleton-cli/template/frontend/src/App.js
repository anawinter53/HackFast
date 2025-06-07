import React from 'react';

function App() {
  const handleClick = async () => {
    try {
      const res = await fetch('/api/hello');
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Error fetching data');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Skeleton Frontend</h1>
      <button onClick={handleClick}>Say Hello (calls backend)</button>
      <img
        src="https://via.placeholder.com/150"
        alt="Sample"
        style={{ display: 'block', marginTop: '1rem' }}
      />
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";

function App() {
  const [data, setData] = useState(null);

  // Fetch data from Flask API
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/data")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>React + Flask App</h1>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}
    </div>
  );
}

export default App;


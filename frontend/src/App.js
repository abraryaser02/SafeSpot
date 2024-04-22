import Map from "./components/Map.js";
import NavBar from "./components/NavBar.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from "react";

const CLIENT_ID = "cd433caa648d451aa7bbdccaea7658a6";
const CLIENT_SECRET = "5069acac77184a78a302939392c4d9ec";

function App() {
  const [accessToken, setAccessToken] = useState('');
  //const [albums, setAlbums] = useState([]);

  useEffect(() => {
    //API Access Token
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }
    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
  }, [])
  console.log(accessToken);
  return (
    <div className="App">
      <NavBar />
      <Map accessToken={accessToken}/>
    </div>
  );
}
export default App;

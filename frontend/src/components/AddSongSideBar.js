import { useState, useEffect } from "react";
import { Container, InputGroup, FormControl, Button, Row, Card, Col } from 'react-bootstrap';

const AddSongSideBar = ({ closeAddSongSidebar }) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [description, setDescription] = useState("");
  const [tracks, setTracks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  
  const SPOTIFY_CLIENT_ID = "cd433caa648d451aa7bbdccaea7658a6";
  const SPOTIFY_CLIENT_SECRET = "5069acac77184a78a302939392c4d9ec";

  useEffect(() => {
    fetchAccessToken();
  }, []);

  const fetchAccessToken = async () => {
    try {
      const authParameters = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`
      };

      const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
      const data = await response.json();
      setAccessToken(data.access_token);
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  };

  const selectSong = (songId) => {
    setSelectedSong(songId);
    // You can perform additional actions here if needed
  };

  async function search() {
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track&market=US&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      console.log(data);
      const extractedTracks = data.tracks.items.map(item => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0].name,
        album: item.album.name,
        preview_url: item.preview_url,
        image_url: item.album.images[0].url
      }));
      setTracks(extractedTracks);
    } catch (error) {
      console.error('Error searching for tracks:', error);
    }
  }

  const addMoment = () => {
    console.log("Add Moment:", { selectedSong, description });
    setDescription("");
  };

  return (
    <aside className="overlay overlay--add">
      <div className="action-button-container">
        <button onClick={closeAddSongSidebar} position="right">
          close add overlay
        </button>
      </div>
      <div className="overlay__outer">
        <div className="overlay__content">
          <section>
            <div className="overlay__section-text">
              What song connects you to this location?
            </div>
            <div className="App">
              <Container>
                <InputGroup className="mb-3" size="lg">
                  <FormControl
                    placeholder="Search for Song"
                    type="input"
                    onKeyPress={event => {
                      if (event.key === "Enter") {
                        search();
                      }
                    }}
                    onChange={event => setSearchInput(event.target.value)}
                  />
                  <Button onClick={search}>
                    Search
                  </Button>
                </InputGroup>
              </Container>
              <Row className="mx-2">
                {tracks
                  .filter(song => selectedSong === null || selectedSong === song.id)
                  .map((song, i) => (
                    <Row key={i} className="row-cols-1 mb-3" onClick={() => selectSong(song.id)}>
                      <Card>
                        <Row noGutters>
                          <Col xs={3} className="d-flex align-items-center">
                            <Card.Img src={song.image_url} />
                          </Col>
                          <Col xs={9}>
                            <Card.Body>
                              <Card.Title>{song.name}</Card.Title>
                              <Card.Text>{song.artist}</Card.Text>
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    </Row>
                  ))
                }
              </Row>
            </div>
            <div className="overlay__section-text">
              Write a note (optional)
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="subform"
              ></textarea>
              <button onClick={addMoment}>Add</button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
};

export default AddSongSideBar;

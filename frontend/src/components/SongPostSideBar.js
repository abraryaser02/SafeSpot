import "../styles/sidebar.css";
import SongPost from "./SongPost";

const SongPostSideBar = ({ closeSongPostSidebar, song, notes }) => {
  return (
    <aside className="overlay overlay--add">
      <div className="action-button-container">
        <button onClick={closeSongPostSidebar} position="right">
          close add overlay
        </button>
      </div>
      <div className="overlay__outer">
        <div className="overlay__content">
          <section>
            <div className="overlay__section-text">Songs in this location:</div>
            <SongPost song={song} description={notes} />
          </section>
        </div>
      </div>
    </aside>
  );
};

export default SongPostSideBar;

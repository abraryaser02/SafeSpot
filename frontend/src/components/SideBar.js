import React, { useState } from "react";
import "../styles/sidebar.css"; // Assume styles are moved to this CSS file

const SideBar = ({ closeSidebar }) => {
  const [song, setSong] = useState("");
  const [description, setDescription] = useState("");

  const addMoment = () => {
    console.log("Add Moment:", { song, description });

    setSong("");
    setDescription("");
  };

  return (
    <aside className="overlay overlay--add">
      <div className="action-button-container">
        <button onClick={closeSidebar} position="right">
          close add overlay
        </button>
      </div>
      <div className="overlay__outer">
        <div className="overlay__content">
          <section>
            <div className="overlay__section-text">
              What song connects you to this location?
            </div>
            <textarea
              value={song}
              onChange={(e) => setSong(e.target.value)}
              className="songform"
            ></textarea>
            <div className="overlay__section-text">
              Write a note (optional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

export default SideBar;

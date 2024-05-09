import React, { useState, useEffect } from "react";
import "../index.css";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const arraysEqual = (a1, a2) => {
    return JSON.stringify(a1) != JSON.stringify(a2);
  };

  useEffect(() => {
    // Fetch initial data from server
    fetchDocuments();
    if (
      localStorage.getItem("documents") === undefined ||
      localStorage.getItem("documents") === null
    ) {
      localStorage.setItem("documents", []);
    }
  }, []);

  useEffect(() => {
    // Save data every 5 seconds
    const saveInterval = setInterval(() => {
      saveDocuments(documents);
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [documents]);

  useEffect(() => {
    // Update elapsed time since last save
    const interval = setInterval(() => {
      if (lastSaved) {
        const currentTime = new Date();
        const difference = currentTime - lastSaved;
        setElapsedTime(Math.floor(difference / 1000)); // Convert milliseconds to seconds
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/documents");
      const data = await response.json();
      setDocuments(data.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const saveDocuments = async (documents) => {
    if (
      !isSaving &&
      (localStorage.getItem("documents") === "" ||
        arraysEqual(documents, JSON.parse(localStorage.getItem("documents"))))
    ) {
      setIsSaving(true);
      try {
        const response = await fetch("/documents-post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(documents),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving documents:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDragStart = (e, position) => {
    e.dataTransfer.setData("position", position);
  };

  const handleDrop = (e, targetPosition) => {
    const draggedPosition = e.dataTransfer.getData("position");
    const updatedDocuments = [...documents];
    const draggedDocument = updatedDocuments.find(
      (doc) => doc.position.toString() === draggedPosition
    );
    const targetDocument = updatedDocuments.find(
      (doc) => doc.position === targetPosition
    );
    const draggedIndex = updatedDocuments.indexOf(draggedDocument);
    const targetIndex = updatedDocuments.indexOf(targetDocument);
    updatedDocuments[draggedIndex].position = targetPosition;
    updatedDocuments[targetIndex].position = draggedPosition;
    updatedDocuments.sort((a, b) => a.position - b.position);
    setDocuments(updatedDocuments);
  };

  const openOverlay = (doc) => {
    setOverlayContent(doc);
    setOverlayVisible(true);
    document.addEventListener("keydown", closeOverlayOnEsc);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    document.removeEventListener("keydown", closeOverlayOnEsc);
  };

  const closeOverlayOnEsc = (event) => {
    if (event.key === "Escape") {
      closeOverlay();
    }
  };

  return (
    <div className="App">
      {
        <div className="last-saved">
          {lastSaved
            ? `Last saved: ${lastSaved.toLocaleTimeString()} (${elapsedTime} seconds ago)`
            : `No data saved yet`}
        </div>
      }
      <div className="container">
        {documents &&
          documents.length &&
          documents.map((document) => (
            <div
              key={document.type}
              className="card"
              draggable
              onDragStart={(e) => handleDragStart(e, document.position)}
              onDrop={(e) => handleDrop(e, document.position)}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => openOverlay(document)}
            >
              <img
                src={document.thumbnail}
                alt={document.title}
                style={{ width: "100%", height: "150px" }}
                loading="lazy"
              />
              <h3>{document.title}</h3>
            </div>
          ))}
      </div>
      {overlayVisible && (
        <div className="overlay" onClick={closeOverlay}>
          <img
            src={overlayContent.thumbnail}
            alt={overlayContent.title}
            style={{ maxWidth: "80%", maxHeight: "80%" }}
            loading="lazy"
          />
          <h3>{overlayContent.title}</h3>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;

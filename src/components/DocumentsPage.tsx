import React, { useState, useEffect, DragEvent, MouseEvent, KeyboardEvent } from "react";
import "../index.css";

interface Document {
  type: string;
  thumbnail: string;
  title: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);
  const [overlayContent, setOverlayContent] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const arraysEqual = (a1: Document[], a2: Document[]): boolean => {
    return JSON.stringify(a1) !== JSON.stringify(a2);
  };

  useEffect(() => {
    // Fetch initial data from server
    fetchDocuments();
    if (
      localStorage.getItem("documents") === undefined ||
      localStorage.getItem("documents") === null
    ) {
      localStorage.setItem("documents", JSON.stringify([]));
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
        const difference = currentTime.getTime() - lastSaved.getTime();
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

  const saveDocuments = async (documents: Document[]) => {
    if (
      !isSaving &&
      (localStorage.getItem("documents") === "" ||
        arraysEqual(documents, JSON.parse(localStorage.getItem("documents") || "[]")))
    ) {
      setIsSaving(true);
      try {
        await fetch("/documents-post", {
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

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("index", index.toString()); // Store the index of the dragged document
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("index"), 10); // Get the dragged index
    if (draggedIndex !== targetIndex) {
      const updatedDocuments = [...documents];
      const [draggedDocument] = updatedDocuments.splice(draggedIndex, 1); // Remove the dragged document
      updatedDocuments.splice(targetIndex, 0, draggedDocument); // Insert the dragged document at the drop target index
      setDocuments(updatedDocuments); // Update the state
    }
  };

  const openOverlay = (doc: Document) => {
    setOverlayContent(doc);
    setOverlayVisible(true);
    document.addEventListener("keydown", closeOverlayOnEsc);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    document.removeEventListener("keydown", closeOverlayOnEsc);
  };

  const closeOverlayOnEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeOverlay();
    }
  };

  return (
    <div className="App">
      <div className="last-saved">
        {lastSaved
          ? `Last saved: ${lastSaved.toLocaleTimeString()} (${elapsedTime} seconds ago)`
          : `No data saved yet`}
      </div>
      <div className="container">
        {documents &&
          documents.length &&
          documents.map((document, index) => (
            <div
              key={document.type}
              className="card"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
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
      {overlayVisible && overlayContent && (
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

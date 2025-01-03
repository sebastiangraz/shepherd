"use client";

import { useState, useEffect } from "react";
import { useBookmarkStore } from "../store/bookmarkStore";
import BookmarkForm from "../components/BookmarkForm";
import BookmarkList from "../components/BookmarkList";
import styles from "./page.module.css";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const initialize = useBookmarkStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Git Bookmarks</h1>
        <button onClick={() => setShowForm(true)} className={styles.addButton}>
          Add Bookmark
        </button>
      </header>

      <main className={styles.main}>
        {showForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <BookmarkForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
        <BookmarkList />
      </main>
    </div>
  );
};

export default Home;

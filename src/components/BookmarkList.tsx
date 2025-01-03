import { useEffect } from "react";
import { useBookmarkStore } from "../store/bookmarkStore";
import styles from "./BookmarkList.module.css";

const BookmarkList = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const isLoading = useBookmarkStore((state) => state.isLoading);
  const error = useBookmarkStore((state) => state.error);
  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  if (isLoading) {
    return <div className={styles.loading}>Loading bookmarks...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (bookmarks.length === 0) {
    return (
      <div className={styles.empty}>No bookmarks yet. Add your first one!</div>
    );
  }

  return (
    <div className={styles.list}>
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className={styles.bookmark}>
          <div className={styles.content}>
            <h3 className={styles.title}>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                {bookmark.title}
              </a>
            </h3>
            {bookmark.description && (
              <p className={styles.description}>{bookmark.description}</p>
            )}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className={styles.tags}>
                {bookmark.tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.meta}>
              <span className={styles.date}>
                Added: {new Date(bookmark.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeBookmark(bookmark.id)}
            className={styles.delete}
            aria-label="Delete bookmark"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;

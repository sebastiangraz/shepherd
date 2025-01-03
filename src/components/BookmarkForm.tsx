import { useState } from "react";
import { useBookmarkStore } from "../store/bookmarkStore";
import styles from "./BookmarkForm.module.css";

interface BookmarkFormProps {
  onClose?: () => void;
}

const BookmarkForm = ({ onClose }: BookmarkFormProps) => {
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addBookmark({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setFormData({
        title: "",
        url: "",
        description: "",
        tags: "",
      });

      onClose?.();
    } catch (error) {
      console.error("Error adding bookmark:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter bookmark title"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="url">URL</label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          placeholder="https://example.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description (optional)"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className={styles.cancel}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? "Adding..." : "Add Bookmark"}
        </button>
      </div>
    </form>
  );
};

export default BookmarkForm;

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Bookmark } from "../types/Bookmark";
import {
  initFS,
  initRepo,
  saveBookmark,
  getBookmarks,
  deleteBookmark,
} from "../lib/gitClient";

interface BookmarkStore {
  bookmarks: Bookmark[];
  isInitialized: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addBookmark: (
    bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  loadBookmarks: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  isInitialized: false,
  isInitializing: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized || get().isInitializing) {
      return;
    }

    try {
      set({ isInitializing: true, error: null });

      await initFS();

      await initRepo();

      await get().loadBookmarks();

      set({ isInitialized: true });
    } catch (error) {
      set({ error: "Failed to initialize bookmark system" });
      console.error("Initialization error:", error);
    } finally {
      set({ isInitializing: false });
    }
  },

  addBookmark: async (bookmarkData) => {
    try {
      if (!get().isInitialized) {
        await get().initialize();
      }

      set({ isLoading: true, error: null });
      const bookmark: Bookmark = {
        ...bookmarkData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedBookmarks = await saveBookmark(bookmark);
      set({ bookmarks: updatedBookmarks });
    } catch (error) {
      set({ error: "Failed to add bookmark" });
      console.error("Add bookmark error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeBookmark: async (id) => {
    try {
      if (!get().isInitialized) {
        await get().initialize();
      }

      set({ isLoading: true, error: null });
      const updatedBookmarks = await deleteBookmark(id);
      set({ bookmarks: updatedBookmarks });
    } catch (error) {
      set({ error: "Failed to remove bookmark" });
      console.error("Remove bookmark error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadBookmarks: async () => {
    try {
      if (!get().isInitialized) {
        await get().initialize();
      }

      set({ isLoading: true, error: null });
      const bookmarks = await getBookmarks();
      set({ bookmarks });
    } catch (error) {
      set({ error: "Failed to load bookmarks" });
      console.error("Load bookmarks error:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

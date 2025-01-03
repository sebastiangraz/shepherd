/* eslint-disable @typescript-eslint/no-explicit-any */
import * as git from "isomorphic-git";
import { configure, BFSRequire } from "browserfs";
import { Bookmark } from "../types/Bookmark";

let fs: any = null;
let path: any = null;

// Initialize BrowserFS
export const initFS = async () => {
  return new Promise<void>((resolve, reject) => {
    // Use LocalStorage backend for better persistence
    configure(
      {
        fs: "LocalStorage",
        options: {},
      },
      (error) => {
        if (error) reject(error);
        // Only require fs and path after BrowserFS is configured
        fs = BFSRequire("fs");
        path = BFSRequire("path");
        resolve();
      }
    );
  });
};

export const REPO_PATH = "/bookmarks";
const BOOKMARKS_FILE = "bookmarks.json";

const assertFsInitialized = () => {
  if (!fs || !path) {
    throw new Error("FileSystem not initialized. Call initFS first.");
  }
};

// Initialize repository
export const initRepo = async () => {
  assertFsInitialized();

  try {
    // Try to create the directory, but don't fail if it exists
    await new Promise<void>((resolve) => {
      fs.mkdir(REPO_PATH, { recursive: true }, () => {
        // Ignore EEXIST error, resolve for both success and "already exists" cases
        resolve();
      });
    });

    // Check if git is already initialized
    const isGitInitialized = fs.existsSync(path.join(REPO_PATH, ".git"));
    if (!isGitInitialized) {
      await git.init({ fs, dir: REPO_PATH });
    }

    // Create initial bookmarks file if it doesn't exist
    const fullPath = path.join(REPO_PATH, BOOKMARKS_FILE);
    if (!fs.existsSync(fullPath)) {
      await new Promise<void>((resolve, reject) => {
        fs.writeFile(
          fullPath,
          JSON.stringify({ bookmarks: [] }, null, 2),
          "utf8",
          (error: any) => {
            if (error) reject(error);
            resolve();
          }
        );
      });
      await addAndCommit(BOOKMARKS_FILE, "Initial commit");
    }
  } catch (error) {
    console.error("Failed to initialize repository:", error);
    throw error;
  }
};

// Add and commit changes
export const addAndCommit = async (filepath: string, message: string) => {
  assertFsInitialized();

  await git.add({ fs, dir: REPO_PATH, filepath });
  return git.commit({
    fs,
    dir: REPO_PATH,
    message,
    author: {
      name: "Bookmark User",
      email: "user@bookmarks.local",
    },
  });
};

// Save bookmark
export const saveBookmark = async (bookmark: Bookmark) => {
  assertFsInitialized();

  try {
    const fullPath = path.join(REPO_PATH, BOOKMARKS_FILE);
    const content = await new Promise<string>((resolve, reject) => {
      fs.readFile(fullPath, "utf8", (error: any, data: string) => {
        if (error) reject(error);
        if (!data) reject(new Error("No data found"));
        resolve(data);
      });
    });

    const data = JSON.parse(content);
    const existingIndex = data.bookmarks.findIndex(
      (b: Bookmark) => b.id === bookmark.id
    );

    if (existingIndex >= 0) {
      data.bookmarks[existingIndex] = bookmark;
    } else {
      data.bookmarks.push(bookmark);
    }

    await new Promise<void>((resolve, reject) => {
      fs.writeFile(
        fullPath,
        JSON.stringify(data, null, 2),
        "utf8",
        (error: any) => {
          if (error) reject(error);
          resolve();
        }
      );
    });

    await addAndCommit(BOOKMARKS_FILE, `Update bookmark: ${bookmark.title}`);
    return data.bookmarks;
  } catch (error) {
    console.error("Failed to save bookmark:", error);
    throw error;
  }
};

// Get all bookmarks
export const getBookmarks = async (): Promise<Bookmark[]> => {
  assertFsInitialized();

  try {
    const fullPath = path.join(REPO_PATH, BOOKMARKS_FILE);
    const content = await new Promise<string>((resolve, reject) => {
      fs.readFile(fullPath, "utf8", (error: any, data: string) => {
        if (error) {
          // If file doesn't exist, return empty array
          if (error.code === "ENOENT") {
            resolve(JSON.stringify({ bookmarks: [] }));
          } else {
            reject(error);
          }
        } else if (!data) {
          resolve(JSON.stringify({ bookmarks: [] }));
        } else {
          resolve(data);
        }
      });
    });

    const data = JSON.parse(content);
    return data.bookmarks;
  } catch (error) {
    console.error("Failed to get bookmarks:", error);
    return [];
  }
};

// Delete bookmark
export const deleteBookmark = async (id: string) => {
  assertFsInitialized();

  try {
    const fullPath = path.join(REPO_PATH, BOOKMARKS_FILE);
    const content = await new Promise<string>((resolve, reject) => {
      fs.readFile(fullPath, "utf8", (error: any, data: string) => {
        if (error) reject(error);
        if (!data) reject(new Error("No data found"));
        resolve(data);
      });
    });

    const data = JSON.parse(content);
    data.bookmarks = data.bookmarks.filter((b: Bookmark) => b.id !== id);

    await new Promise<void>((resolve, reject) => {
      fs.writeFile(
        fullPath,
        JSON.stringify(data, null, 2),
        "utf8",
        (error: any) => {
          if (error) reject(error);
          resolve();
        }
      );
    });

    await addAndCommit(BOOKMARKS_FILE, `Delete bookmark: ${id}`);
    return data.bookmarks;
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    throw error;
  }
};

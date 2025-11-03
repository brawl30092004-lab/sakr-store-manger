import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook to resolve relative image paths to absolute file:// URLs
 * This handles the conversion from "images/product-1.webp" to "file:///C:/path/to/project/images/product-1.webp"
 * 
 * @param {string} relativePath - Relative image path from products.json
 * @returns {string|null} Absolute file:// URL or data URL, or null if not found
 */
export function useImagePath(relativePath) {
  const [resolvedPath, setResolvedPath] = useState(null);
  const projectPath = useSelector(state => state.settings.projectPath);

  useEffect(() => {
    async function resolvePath() {
      // Handle empty or null paths
      if (!relativePath) {
        setResolvedPath(null);
        return;
      }

      // Handle data URLs (base64 encoded images)
      if (relativePath.startsWith('data:')) {
        setResolvedPath(relativePath);
        return;
      }

      // Handle custom protocol URLs (already resolved)
      if (relativePath.startsWith('local-image://') || relativePath.startsWith('file://')) {
        setResolvedPath(relativePath);
        return;
      }

      // Resolve relative path using Electron IPC
      if (projectPath && window.electron?.fs?.getImagePath) {
        try {
          const absolutePath = await window.electron.fs.getImagePath(projectPath, relativePath);
          setResolvedPath(absolutePath);
        } catch (error) {
          console.error('Failed to resolve image path:', error);
          setResolvedPath(null);
        }
      } else {
        // Fallback: try relative path as-is (may not work in Electron)
        setResolvedPath(relativePath);
      }
    }

    resolvePath();
  }, [relativePath, projectPath]);

  return resolvedPath;
}

/**
 * Custom hook to resolve multiple image paths at once
 * 
 * @param {string[]} relativePaths - Array of relative image paths
 * @returns {string[]} Array of resolved paths (nulls for failed resolutions)
 */
export function useImagePaths(relativePaths) {
  const [resolvedPaths, setResolvedPaths] = useState([]);
  const projectPath = useSelector(state => state.settings.projectPath);

  useEffect(() => {
    async function resolvePaths() {
      if (!relativePaths || relativePaths.length === 0) {
        setResolvedPaths([]);
        return;
      }

      const promises = relativePaths.map(async (relativePath) => {
        if (!relativePath) return null;
        if (relativePath.startsWith('data:')) return relativePath;
        if (relativePath.startsWith('local-image://') || relativePath.startsWith('file://')) return relativePath;

        if (projectPath && window.electron?.fs?.getImagePath) {
          try {
            return await window.electron.fs.getImagePath(projectPath, relativePath);
          } catch (error) {
            console.error('Failed to resolve image path:', error);
            return null;
          }
        }
        
        return relativePath;
      });

      const results = await Promise.all(promises);
      setResolvedPaths(results);
    }

    resolvePaths();
  }, [relativePaths, projectPath]);

  return resolvedPaths;
}

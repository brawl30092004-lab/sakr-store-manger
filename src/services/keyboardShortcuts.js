/**
 * Keyboard Shortcuts Service
 * Manages global keyboard shortcuts for the application
 */

/**
 * Attach keyboard shortcuts to the window
 * @param {Object} handlers - Object containing shortcut handlers
 * @param {Function} handlers.onNewProduct - Ctrl+N handler
 * @param {Function} handlers.onSave - Ctrl+S handler
 * @param {Function} handlers.onPublish - Ctrl+P handler
 * @param {Function} handlers.onFocusSearch - Ctrl+F handler
 * @param {Function} handlers.onDelete - Delete handler
 * @param {Function} handlers.onEscape - Escape handler
 * @param {Function} handlers.onEnter - Enter handler
 * @param {Function} handlers.onReload - Ctrl+R handler
 * @param {Function} handlers.onZoomIn - Ctrl++ handler
 * @param {Function} handlers.onZoomOut - Ctrl+- handler
 * @param {Function} handlers.onActualSize - Ctrl+0 handler
 * @param {Function} handlers.onToggleFullscreen - F11 handler
 * @param {Function} handlers.onCommandPalette - Ctrl+K handler
 * @param {Function} handlers.onDashboard - Ctrl+D handler
 */
export const attachKeyboardShortcuts = (handlers) => {
  const handleKeyDown = (e) => {
    // Check if user is typing in an input, textarea, or contenteditable element
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    // Ctrl+K - Command Palette (priority - works even when typing)
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (handlers.onCommandPalette) {
        handlers.onCommandPalette();
      }
      return;
    }

    // Ctrl+D - Dashboard
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      if (handlers.onDashboard) {
        handlers.onDashboard();
      }
      return;
    }

    // Ctrl+N - New Product
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      if (handlers.onNewProduct) {
        handlers.onNewProduct();
      }
      return;
    }

    // Ctrl+S - Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (handlers.onSave) {
        handlers.onSave();
      }
      return;
    }

    // Ctrl+P - Publish to GitHub
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      if (handlers.onPublish) {
        handlers.onPublish();
      }
      return;
    }

    // Ctrl+F - Focus Search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      if (handlers.onFocusSearch) {
        handlers.onFocusSearch();
      }
      return;
    }

    // Ctrl+R - Reload
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      if (handlers.onReload) {
        handlers.onReload();
      }
      return;
    }

    // Ctrl+0 - Actual Size
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      if (handlers.onActualSize) {
        handlers.onActualSize();
      }
      return;
    }

    // Ctrl++ - Zoom In (handles both + and =)
    if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      if (handlers.onZoomIn) {
        handlers.onZoomIn();
      }
      return;
    }

    // Ctrl+- - Zoom Out
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      if (handlers.onZoomOut) {
        handlers.onZoomOut();
      }
      return;
    }

    // F11 - Toggle Fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      if (handlers.onToggleFullscreen) {
        handlers.onToggleFullscreen();
      }
      return;
    }

    // Delete - Delete selected product (only when not typing)
    if (e.key === 'Delete' && !isTyping) {
      if (handlers.onDelete) {
        handlers.onDelete();
      }
      return;
    }

    // Escape - Close modal/form
    if (e.key === 'Escape') {
      if (handlers.onEscape) {
        handlers.onEscape();
      }
      return;
    }

    // Enter - Submit form (only when in a form context and not in textarea)
    if (e.key === 'Enter' && !e.shiftKey) {
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        // Allow normal Enter behavior in textareas
        return;
      }
      
      // Check if we're in a form
      const form = activeElement?.closest('form');
      if (form && handlers.onEnter) {
        e.preventDefault();
        handlers.onEnter();
      }
      return;
    }
  };

  // Attach event listener
  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Get keyboard shortcut display text based on platform
 * @param {string} shortcut - Shortcut key combination
 * @returns {string} Display text for the shortcut
 */
export const getShortcutText = (shortcut) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrl = isMac ? '⌘' : 'Ctrl';
  
  const shortcuts = {
    'new': `${ctrl}+N`,
    'save': `${ctrl}+S`,
    'publish': `${ctrl}+P`,
    'search': `${ctrl}+F`,
    'delete': 'Delete',
    'escape': 'Esc',
    'enter': 'Enter'
  };
  
  return shortcuts[shortcut] || '';
};

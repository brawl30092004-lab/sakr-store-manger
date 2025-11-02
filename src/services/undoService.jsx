/**
 * Undo Service
 * Manages undo functionality for destructive actions
 * Stores action history and allows users to revert changes
 */

import { showSuccess, showWarning } from './toastService';
import toast from 'react-hot-toast';

class UndoService {
  constructor() {
    this.undoStack = [];
    this.maxStackSize = 20; // Keep last 20 actions
  }

  /**
   * Add an action to the undo stack
   * @param {Object} action - Action details
   * @param {string} action.type - Type of action (e.g., 'DELETE_PRODUCT', 'BULK_DELETE')
   * @param {any} action.data - Data needed to undo the action
   * @param {Function} action.undo - Function to execute when undoing
   * @param {string} action.description - Human-readable description
   */
  addAction(action) {
    this.undoStack.push({
      ...action,
      timestamp: Date.now(),
    });

    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  /**
   * Get the most recent action
   * @returns {Object|null} - The most recent action or null if stack is empty
   */
  getLastAction() {
    return this.undoStack.length > 0 
      ? this.undoStack[this.undoStack.length - 1] 
      : null;
  }

  /**
   * Remove and return the most recent action
   * @returns {Object|null} - The popped action or null if stack is empty
   */
  popAction() {
    return this.undoStack.pop() || null;
  }

  /**
   * Clear the undo stack
   */
  clearStack() {
    this.undoStack = [];
  }

  /**
   * Get the size of the undo stack
   * @returns {number} - Number of actions in the stack
   */
  getStackSize() {
    return this.undoStack.length;
  }

  /**
   * Show an undo toast notification with an undo button
   * @param {Object} action - Action details
   * @param {Function} onUndo - Callback to execute when undo is clicked
   * @param {number} duration - Duration to show the toast (default: 8000ms)
   */
  showUndoToast(action, onUndo, duration = 8000) {
    const toastId = toast.custom(
      (t) => (
        <div
          className={`undo-toast ${t.visible ? 'undo-toast-visible' : 'undo-toast-hidden'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#161b22',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: '#e6edf3', fontSize: '14px', fontWeight: '500' }}>
              {action.description}
            </p>
          </div>
          <button
            onClick={() => {
              onUndo();
              toast.dismiss(toastId);
            }}
            style={{
              background: '#1f6feb',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#58a6ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1f6feb';
            }}
          >
            Undo
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{
              background: 'transparent',
              color: '#8b949e',
              border: 'none',
              padding: '4px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(177, 186, 196, 0.12)';
              e.target.style.color = '#c9d1d9';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#8b949e';
            }}
          >
            ✕
          </button>
        </div>
      ),
      {
        duration,
        position: 'bottom-right',
      }
    );

    return toastId;
  }

  /**
   * Execute an undo action
   * @param {Object} action - Action to undo
   * @returns {Promise<boolean>} - Whether the undo was successful
   */
  async executeUndo(action) {
    if (!action || typeof action.undo !== 'function') {
      showWarning('Cannot undo this action');
      return false;
    }

    try {
      await action.undo();
      showSuccess('Action undone successfully');
      return true;
    } catch (error) {
      console.error('Error executing undo:', error);
      showWarning('Failed to undo action');
      return false;
    }
  }
}

// Create singleton instance
const undoService = new UndoService();

// Export service and helper functions
export default undoService;

export const addUndoAction = (action) => undoService.addAction(action);
export const showUndoNotification = (action, onUndo, duration) => 
  undoService.showUndoToast(action, onUndo, duration);
export const executeUndo = (action) => undoService.executeUndo(action);
export const getLastUndoAction = () => undoService.getLastAction();
export const clearUndoHistory = () => undoService.clearStack();

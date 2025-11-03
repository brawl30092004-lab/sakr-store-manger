import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Package, 
  ChevronRight
} from 'lucide-react';
import './CommandPalette.css';

/**
 * CommandPalette - Keyboard-driven command interface (Ctrl+K)
 * Provides quick access to all app functions for advanced users
 */
function CommandPalette({ isOpen, onClose, commands }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Use provided commands or empty array
  const allCommands = useMemo(() => {
    return commands || [];
  }, [commands]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) {
      return allCommands;
    }

    const searchLower = search.toLowerCase();
    return allCommands.filter(cmd => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower);
      const categoryMatch = cmd.category.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords?.some(kw => kw.includes(searchLower));
      return labelMatch || categoryMatch || keywordMatch;
    });
  }, [search, allCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector('.command-item-selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const executeCommand = (command) => {
    if (command.action) {
      command.action();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-search">
          <Search size={18} className="command-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="command-close-hint">Esc</kbd>
        </div>

        <div className="command-palette-list" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="command-no-results">
              <Package size={32} />
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="command-group">
                <div className="command-group-label">{category}</div>
                {cmds.map((cmd, index) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      className={`command-item ${globalIndex === selectedIndex ? 'command-item-selected' : ''}`}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div className="command-item-icon">{cmd.icon}</div>
                      <span className="command-item-label">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="command-item-shortcut">{cmd.shortcut}</kbd>
                      )}
                      <ChevronRight size={14} className="command-item-arrow" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span>
            <kbd>↑</kbd><kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>Enter</kbd> Select
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

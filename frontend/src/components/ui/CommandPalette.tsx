import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
  category?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = 'Type a command or search...',
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search query
  const filteredCommands = commands.filter(
    (command) =>
      command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
            setSearchQuery('');
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          setSearchQuery('');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="command-palette-overlay"
    >
      <div
        className="w-full max-w-2xl bg-sentinel-surface border border-sentinel-border rounded-lg shadow-sentinel-glow overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="command-palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-sentinel-border">
          <Search className="w-5 h-5 text-sentinel-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sentinel-text placeholder-sentinel-text-muted outline-none text-base"
            data-testid="command-palette-input"
          />
          <kbd className="px-2 py-1 text-xs bg-sentinel-bg-elevated border border-sentinel-border rounded text-sentinel-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[400px] overflow-y-auto"
          data-testid="command-palette-results"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sentinel-text-muted">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-4 py-2 text-xs font-semibold text-sentinel-text-muted uppercase tracking-wider">
                    {category}
                  </div>

                  {/* Commands in Category */}
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={command.id}
                        data-index={globalIndex}
                        onClick={() => {
                          command.action();
                          onClose();
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-120 ${
                          isSelected
                            ? 'bg-sentinel-hover text-sentinel-primary'
                            : 'text-sentinel-text hover:bg-sentinel-hover/50'
                        }`}
                        data-testid={`command-${command.id}`}
                      >
                        {/* Icon */}
                        {command.icon && (
                          <div className="w-5 h-5 flex items-center justify-center">
                            {command.icon}
                          </div>
                        )}

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{command.label}</div>
                          {command.description && (
                            <div className="text-sm text-sentinel-text-muted truncate">
                              {command.description}
                            </div>
                          )}
                        </div>

                        {/* Shortcut */}
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs bg-sentinel-bg-elevated border border-sentinel-border rounded text-sentinel-text-muted">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-sentinel-border bg-sentinel-bg-elevated">
          <div className="flex items-center gap-4 text-xs text-sentinel-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-sentinel-surface border border-sentinel-border rounded">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-sentinel-surface border border-sentinel-border rounded">
                ↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-sentinel-surface border border-sentinel-border rounded">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-sentinel-surface border border-sentinel-border rounded">
                ESC
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Integration } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Checkbox,
} from '@/components/ui/checkbox';

interface IntegrationSelectorProps {
  integrations: Integration[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export function IntegrationSelector({
  integrations,
  onChange,
  disabled,
}: IntegrationSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange(selectedIds);
  }, [selectedIds, onChange]);

  const toggleIntegration = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === integrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(integrations.map((i) => i.id));
    }
  };

  return (
    <div className="w-full" ref={popoverRef}>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        Integrations (optional)
      </label>
      <Popover open={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-9 py-1.5 text-left text-sm"
            disabled={disabled}
          >
            <span className="truncate flex-1">
              {selectedIds.length === 0
                ? 'Select integrations...'
                : `${selectedIds.length} selected`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-h-72 p-1.5" sideOffset={4} align="start">
          <div className="flex items-center justify-between px-1.5 py-1.5 border-b">
            <span className="text-xs font-medium">Available</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-6 px-1.5"
            >
              {selectedIds.length === integrations.length ? 'Deselect all' : 'Select all'}
            </Button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center gap-2 px-1.5 py-1.5 hover:bg-accent rounded cursor-pointer transition-colors"
                onClick={() => toggleIntegration(integration.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(integration.id)}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                  disabled={disabled}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{integration.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {integration.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2" role="status" aria-live="polite">
          {selectedIds.map((id) => {
            const integration = integrations.find((i) => i.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
              >
                {integration?.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIntegration(id);
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                  aria-label={`Remove ${integration?.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
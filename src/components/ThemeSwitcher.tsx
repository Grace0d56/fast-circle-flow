import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Sun, Moon, Check } from 'lucide-react';

export type ThemeMode = 'dark' | 'light';
export type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange' | 'pink' | 'green';

interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}

const COLOR_OPTIONS: { value: ThemeColor; label: string; hsl: string }[] = [
  { value: 'teal', label: 'Teal', hsl: '168 84% 44%' },
  { value: 'blue', label: 'Ocean', hsl: '210 90% 50%' },
  { value: 'purple', label: 'Violet', hsl: '270 70% 55%' },
  { value: 'orange', label: 'Sunset', hsl: '25 95% 53%' },
  { value: 'pink', label: 'Rose', hsl: '330 80% 55%' },
  { value: 'green', label: 'Forest', hsl: '142 70% 40%' },
];

const THEME_STORAGE_KEY = 'fasttrack-theme';

const getStoredTheme = (): ThemeConfig => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading theme:', e);
  }
  return { mode: 'dark', color: 'teal' };
};

const saveTheme = (theme: ThemeConfig) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.error('Error saving theme:', e);
  }
};

const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  const colorConfig = COLOR_OPTIONS.find(c => c.value === theme.color) || COLOR_OPTIONS[0];

  if (theme.mode === 'light') {
    root.style.setProperty('--background', '0 0% 98%');
    root.style.setProperty('--foreground', '220 20% 10%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '220 20% 10%');
    root.style.setProperty('--popover', '0 0% 100%');
    root.style.setProperty('--popover-foreground', '220 20% 10%');
    root.style.setProperty('--secondary', '220 15% 92%');
    root.style.setProperty('--secondary-foreground', '220 20% 10%');
    root.style.setProperty('--muted', '220 15% 95%');
    root.style.setProperty('--muted-foreground', '220 10% 40%');
    root.style.setProperty('--border', '220 15% 88%');
    root.style.setProperty('--input', '220 15% 88%');
  } else {
    root.style.setProperty('--background', '220 20% 7%');
    root.style.setProperty('--foreground', '180 20% 95%');
    root.style.setProperty('--card', '220 18% 10%');
    root.style.setProperty('--card-foreground', '180 20% 95%');
    root.style.setProperty('--popover', '220 18% 10%');
    root.style.setProperty('--popover-foreground', '180 20% 95%');
    root.style.setProperty('--secondary', '220 18% 14%');
    root.style.setProperty('--secondary-foreground', '180 20% 95%');
    root.style.setProperty('--muted', '220 18% 16%');
    root.style.setProperty('--muted-foreground', '220 10% 55%');
    root.style.setProperty('--border', '220 18% 18%');
    root.style.setProperty('--input', '220 18% 18%');
  }

  // Apply accent color
  root.style.setProperty('--primary', colorConfig.hsl);
  root.style.setProperty('--accent', colorConfig.hsl);
  root.style.setProperty('--ring', colorConfig.hsl);

  // Update gradient
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${colorConfig.hsl}) 0%, hsl(${colorConfig.hsl} / 0.7) 100%)`);
  root.style.setProperty('--shadow-glow', `0 0 60px hsl(${colorConfig.hsl} / 0.25)`);
};

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<ThemeConfig>(getStoredTheme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const updateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  };

  const toggleMode = () => {
    updateTheme({ ...theme, mode: theme.mode === 'dark' ? 'light' : 'dark' });
  };

  const setColor = (color: ThemeColor) => {
    updateTheme({ ...theme, color });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Mode</p>
            <div className="flex gap-2">
              <Button
                variant={theme.mode === 'light' ? 'default' : 'glass'}
                size="sm"
                onClick={() => updateTheme({ ...theme, mode: 'light' })}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme.mode === 'dark' ? 'default' : 'glass'}
                size="sm"
                onClick={() => updateTheme({ ...theme, mode: 'dark' })}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Accent Color</p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
                  style={{
                    borderColor: theme.color === colorOption.value ? `hsl(${colorOption.hsl})` : undefined
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: `hsl(${colorOption.hsl})` }}
                  />
                  <span className="text-xs text-muted-foreground">{colorOption.label}</span>
                  {theme.color === colorOption.value && (
                    <Check
                      className="absolute top-1 right-1 w-3 h-3"
                      style={{ color: `hsl(${colorOption.hsl})` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

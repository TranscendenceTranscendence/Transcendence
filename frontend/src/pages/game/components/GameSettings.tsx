import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface GameSettingsProps {
  onClose: () => void;
  onApply: (settings: GameSettingsValues) => void;
  defaultSettings?: GameSettingsValues;
}

export interface GameSettingsValues {
  paddleColor: string;
  difficulty: string;
  soundEnabled: boolean;
}

export function GameSettings({
  onClose,
  onApply,
  defaultSettings,
}: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettingsValues>(
    defaultSettings || {
      paddleColor: "white",
      difficulty: "normal",
      soundEnabled: true,
    },
  );

  const handleApply = () => {
    onApply(settings);
    onClose();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Game Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="settings-content">
          <div className="setting-group">
            <h3>Paddle Color</h3>
            <div className="color-options">
              {["white", "#4CAF50", "#F44336", "#2196F3", "#FFEB3B"].map(
                (color) => (
                  <div
                    key={color}
                    className={`color-option ${settings.paddleColor === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setSettings({ ...settings, paddleColor: color })
                    }
                  />
                ),
              )}
            </div>
          </div>

          <div className="setting-group">
            <h3>Difficulty</h3>
            <RadioGroup
              value={settings.difficulty}
              onValueChange={(value) =>
                setSettings({ ...settings, difficulty: value })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard">Hard</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="setting-group">
            <h3>Sound</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sound"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, soundEnabled: e.target.checked })
                }
                className="sound-checkbox"
              />
              <Label htmlFor="sound">Enable sound effects</Label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Settings</Button>
        </div>
      </div>
    </div>
  );
}

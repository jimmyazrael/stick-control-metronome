import { useState, useEffect } from 'react';

export function usePresets() {
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('presets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('presets', JSON.stringify(presets));
  }, [presets]);

  const savePreset = (name, config) => {
    const newPreset = { id: Date.now(), name, ...config };
    setPresets([...presets, newPreset]);
    return newPreset;
  };

  const deletePreset = (id) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  const renamePreset = (id, newName) => {
    setPresets(presets.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const loadPreset = (id) => {
    return presets.find(p => p.id === id);
  };

  return { presets, savePreset, deletePreset, renamePreset, loadPreset };
}

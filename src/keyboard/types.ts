export interface KeyCombo {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export interface KeybindingRegistration {
  id: string;
  combo: KeyCombo;
  description?: string;
  pid?: number;
  handler: (event: KeyboardEvent) => void;
}

export interface KeymapContextValue {
  register(registration: KeybindingRegistration): () => void;
  getBindings(): KeybindingRegistration[];
}

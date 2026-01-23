/** Sticky note colors - muted tones similar to n8n */
export const STICKY_NOTE_COLORS = [
  { name: 'Dark', value: '#3D3526', border: '#6B5E45' },
  { name: 'Gray', value: '#3A3A3A', border: '#5A5A5A' },
  { name: 'Blue', value: '#2D3A4D', border: '#4A6080' },
  { name: 'Green', value: '#2D3D2D', border: '#4A6B4A' },
  { name: 'Purple', value: '#3D2D4D', border: '#6B4A80' },
  { name: 'Red', value: '#4D2D2D', border: '#804A4A' },
] as const

export const DEFAULT_STICKY_NOTE_COLOR = STICKY_NOTE_COLORS[0]

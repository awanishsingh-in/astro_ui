import type { Varga } from '@/types/astrology'

/**
 * The sixteen divisional charts. `primary: true` ones sit in the rail on the
 * chart dashboard; the rest live in the picker sheet.
 */
export const vargas: Varga[] = [
  { code: 'D1', name: 'Rashi', signifies: 'the whole life', primary: true },
  { code: 'D9', name: 'Navamsa', signifies: 'marriage, real strength', primary: true },
  { code: 'D10', name: 'Dashamsa', signifies: 'work, standing', primary: true },
  { code: 'D2', name: 'Hora', signifies: 'wealth', primary: false },
  { code: 'D3', name: 'Drekkana', signifies: 'siblings', primary: false },
  { code: 'D4', name: 'Chaturthamsa', signifies: 'home, property', primary: false },
  { code: 'D7', name: 'Saptamsa', signifies: 'children', primary: false },
  { code: 'D12', name: 'Dwadashamsa', signifies: 'parents', primary: false },
  { code: 'D16', name: 'Shodashamsa', signifies: 'vehicles, comfort', primary: false },
  { code: 'D20', name: 'Vimshamsa', signifies: 'spiritual practice', primary: false },
  { code: 'D24', name: 'Chaturvimshamsa', signifies: 'learning', primary: false },
  { code: 'D27', name: 'Bhamsa', signifies: 'strength, stamina', primary: false },
  { code: 'D30', name: 'Trimshamsa', signifies: 'difficulty', primary: false },
  { code: 'D40', name: 'Khavedamsa', signifies: 'maternal legacy', primary: false },
  { code: 'D45', name: 'Akshavedamsa', signifies: 'paternal legacy', primary: false },
  { code: 'D60', name: 'Shashtiamsa', signifies: 'the whole again, finely', primary: false },
]

export const primaryVargas = vargas.filter((v) => v.primary)
export const secondaryVargas = vargas.filter((v) => !v.primary)

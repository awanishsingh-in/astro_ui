/**
 * The eight kootas of Guna Milan, as lookup tables.
 *
 * Five of these (Varna, Gana, Nadi, Bhakoot, Tara) are compact enough to carry
 * in full, so they are implemented exactly. Three (Yoni, Vashya, Graha Maitri)
 * rest on large compatibility matrices; those use a documented grouping rather
 * than the full grid, and the UI says so rather than implying otherwise.
 *
 * Indices are 0-based: nakshatra 0 = Ashwini, rashi 0 = Mesha.
 */

/** Varna by rashi: Brahmin 3, Kshatriya 2, Vaishya 1, Shudra 0. */
export const VARNA_BY_RASHI = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]
export const VARNA_NAMES = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin']

/** Vashya group by rashi. Same group scores full; adjacent groups score partly. */
export const VASHYA_BY_RASHI = [0, 0, 1, 2, 0, 1, 3, 2, 4, 4, 1, 2]
/** Gana by nakshatra: 0 Deva, 1 Manushya, 2 Rakshasa. */
export const GANA_BY_NAKSHATRA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, // Ashwini … Ashlesha
  2, 1, 1, 0, 2, 0, 2, 0, 2, // Magha … Jyeshtha
  2, 1, 1, 0, 2, 2, 1, 1, 0, // Mula … Revati
]
export const GANA_NAMES = ['Deva', 'Manushya', 'Rakshasa']

/** Nadi by nakshatra: 0 Adi, 1 Madhya, 2 Antya. */
export const NADI_BY_NAKSHATRA = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, // Ashwini … Ashlesha
  2, 1, 0, 0, 1, 2, 2, 1, 0, // Magha … Jyeshtha
  0, 1, 2, 2, 1, 0, 0, 1, 2, // Mula … Revati
]
export const NADI_NAMES = ['Adi', 'Madhya', 'Antya']

/**
 * Yoni animal by nakshatra. The full 14×14 matrix is replaced by three bands —
 * same animal, compatible pair, opposed pair — which is the grouping the
 * classical matrix mostly collapses to.
 */
export const YONI_BY_NAKSHATRA = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat',
  'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant',
]

/** Pairs that classically oppose each other. Everything else reads as neutral. */
export const YONI_OPPOSED: [string, string][] = [
  ['Cow', 'Tiger'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Dog', 'Deer'],
  ['Serpent', 'Mongoose'],
  ['Cat', 'Rat'],
  ['Monkey', 'Sheep'],
]

/** Natural friendship between the seven graha rulers, for Graha Maitri. */
export const GRAHA_FRIENDS: Record<string, string[]> = {
  Su: ['Mo', 'Ma', 'Ju'],
  Mo: ['Su', 'Me'],
  Ma: ['Su', 'Mo', 'Ju'],
  Me: ['Su', 'Ve'],
  Ju: ['Su', 'Mo', 'Ma'],
  Ve: ['Me', 'Sa'],
  Sa: ['Me', 'Ve'],
}

/** The eight kootas and the points each carries. They total 36. */
export const KOOTAS = [
  { id: 'varna', name: 'Varna', max: 1, reads: 'the working temperament each brings' },
  { id: 'vashya', name: 'Vashya', max: 2, reads: 'who tends to lead, and whether that is accepted' },
  { id: 'tara', name: 'Tara', max: 3, reads: 'how the two birth stars sit against each other' },
  { id: 'yoni', name: 'Yoni', max: 4, reads: 'physical and instinctive compatibility' },
  { id: 'maitri', name: 'Graha Maitri', max: 5, reads: 'whether the two minds get on' },
  { id: 'gana', name: 'Gana', max: 6, reads: 'disposition — how each one meets the world' },
  { id: 'bhakoot', name: 'Bhakoot', max: 7, reads: 'the health and direction of the household' },
  { id: 'nadi', name: 'Nadi', max: 8, reads: 'constitution, and what the tradition says of children' },
] as const

export type KootaId = (typeof KOOTAS)[number]['id']

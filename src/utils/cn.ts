import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Class merging, taught our design tokens.
 *
 * tailwind-merge only knows Tailwind's stock scales. Left alone it reads
 * `text-title` as a *colour* (any unknown `text-*` falls through to the colour
 * group) and then silently drops the `text-white` beside it. Declaring the
 * custom scales here keeps conflict resolution correct — a caller's
 * `className` overrides a component default, and nothing else is removed.
 *
 * Add a token to `tokens.css` and add it here in the same change.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'display-lg',
            'title',
            'title-lg',
            'heading',
            'body',
            'sub',
            'label',
            'data',
            'data-lg',
          ],
        },
      ],
      rounded: [{ rounded: ['xs', 'control', 'card', 'panel', 'sheet'] }],
      shadow: [{ shadow: ['card', 'raised', 'overlay', 'sheet', 'focus'] }],
      h: [{ h: ['control-sm', 'control-md', 'control-lg', 'topnav', 'mobilebar', 'bottomnav'] }],
      'min-h': [{ 'min-h': ['control-sm', 'control-md', 'control-lg'] }],
      'max-w': [{ 'max-w': ['reading', 'content', 'wide'] }],
    },
  },
})

/**
 * Merge class names, resolving Tailwind conflicts so a caller's `className`
 * always wins over a component's defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

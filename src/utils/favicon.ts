export const FAVICON_VIEWBOX = '0 0 128 128';

export const FAVICON_COLORS = {
  dark: {
    primary: 'hsl(162 68% 44%)',
  },
  light: {
    primary: 'hsl(162 68% 44%)',
  },
};

export function faviconShapes(): string {
  return `
    <path class="fav-outline" d="M64 100.6H106.6" stroke-width="14.6" />
    <path class="fav-outline" d="M21.3 90.6 53.3 58.6 21.3 26.6" stroke-width="14.6" />
  `;
}

export function faviconStyles(): string {
  const { dark, light } = FAVICON_COLORS;
  
  return `<style>
    .fav-outline {
      fill: none;
      stroke: ${dark.primary};
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    @media (prefers-color-scheme: light) {
      .fav-outline {
        stroke: ${light.primary};
      }
    }
  </style>`;
}
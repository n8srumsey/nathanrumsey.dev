export const FAVICON_VIEWBOX = '0 0 128 128';

// Color tokens for the standalone favicon.svg — keep in sync with src/styles/global.css.
// The inline FaviconIcon component uses CSS variables instead.
export const FAVICON_COLORS = {
  dark: {
    frame: 'hsl(220 13% 18%)',
    screen: 'hsl(207 35% 8%)',
    primary: 'hsl(162 68% 44%)',
  },
  light: {
    frame: '#4b5563',
    screen: '#1e293b',
  },
};

export function faviconShapes(): string {
  return `<rect class="fav-frame" x="4" y="4" width="120" height="82" rx="7"/>
  <rect class="fav-screen" x="12" y="12" width="104" height="66"/>
  <text class="fav-monogram" x="64" y="45" text-anchor="middle" dominant-baseline="middle"
        font-family="'Courier New', Courier, monospace" font-weight="700" font-size="44">NR</text>
  <rect class="fav-frame" x="60" y="86" width="8" height="14"/>
  <rect class="fav-frame" x="36" y="99" width="56" height="7" rx="3"/>
  <rect class="fav-frame" x="12" y="109" width="104" height="16" rx="5"/>
  <rect class="fav-keyline" x="18" y="112" width="92" height="3" rx="1"/>
  <rect class="fav-keyline" x="18" y="117" width="92" height="3" rx="1"/>
  <rect class="fav-keyline" x="22" y="122" width="84" height="2" rx="1"/>`;
}

export function faviconStyles(): string {
  const { dark, light } = FAVICON_COLORS;
  return `<style>
    .fav-frame { fill: ${dark.frame}; }
    .fav-screen { fill: ${dark.screen}; }
    .fav-monogram { fill: ${dark.primary}; }
    .fav-keyline { fill: ${dark.screen}; }
    @media (prefers-color-scheme: light) {
      .fav-frame { fill: ${light.frame}; }
      .fav-screen { fill: ${light.screen}; }
      .fav-keyline { fill: ${light.screen}; }
    }
  </style>`;
}

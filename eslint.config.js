import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/'] },
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    extends: tseslint.configs.recommended,
  },
);

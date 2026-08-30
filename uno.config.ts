import { defineConfig, presetAttributify, presetWind3, transformerVariantGroup } from 'unocss';

export default defineConfig({
  presets: [presetWind3({ dark: 'class' }), presetAttributify()],
  shortcuts: {
    'wh-full': 'w-full h-full',
    'flex-center': 'flex justify-center items-center',
    'flex-x-center': 'flex justify-center',
    'flex-y-center': 'flex items-center',
  },
  transformers: [
    transformerVariantGroup(),
  ],
});

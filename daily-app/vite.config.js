import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: true
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __UNI_FEATURE_I18N_EN__: false,
    __UNI_FEATURE_I18N_ES__: false,
    __UNI_FEATURE_I18N_FR__: false,
    __UNI_FEATURE_I18N_ZH_HANS__: true,
    __UNI_FEATURE_I18N_ZH_HANT__: false
  }
})

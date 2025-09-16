import {
  defineConfig,
  loadEnv
} from "vite";
import vue from "@vitejs/plugin-vue";
// 拼接路径
const resolve = dir => require('path').join(__dirname, dir)
import {
  viteMockServe
} from "vite-plugin-mock";
import viteCompression from "vite-plugin-compression";
const proEnv = require('./config/pro.env') // 生产环境
const devEnv = require('./config/dev.env') // 开发环境

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const env = process.env.NODE_ENV

  let target = {}
  // 默认是本地环境
  if (env === 'production') { // 生产环境
    target = proEnv.hosturl
  } else { // 本地环境
    target = devEnv.hosturl
  }

  // 生成代理配置对象
  const proxyObj = {}
  for (const key in target) {
    proxyObj[key] = {
      target: target[key],
      changeOrigin: true,
      ws: true,
      rewrite: {
        [`^${key}`]: key
      }
    }
  }

  return {
    viteMockServe: {
      supportTs: false,
      logger: false,
      mockPath: "./mock/index.js",
    },

    resolve: {
      alias: {
        // 设置路径
        '@api': resolve('src/api'),
        '@utils': resolve('src/utils'),
        '@': resolve('src'),
        'assets': resolve('src/assets'),
        'components': resolve('src/components'),
        'views': resolve('src/views'),
      },
    },

    plugins: [
      vue(),
      viteCompression({
        //gzip压缩
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz",
      }),
    ],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // chunkSizeWarningLimit: 1500,大文件报警阈值设置,不建议使用
      rollupOptions: {
        output: {
          //静态资源分类打包
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            //静态资源分拆打包
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
    },
    css: {
      /* CSS 预处理器   导入全局样式*/
      preprocessorOptions: {
        scss: {
          // additionalData: `@use "@/styles/element/index.scss" as *;`,
        },
      },
    },
    server: { //同plugins同级
      host: '0.0.0.0',
      port: 8080, //本地端口号
      proxy: proxyObj,
    },
  }
});
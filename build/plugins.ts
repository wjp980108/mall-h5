import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import compressPlugin from 'vite-plugin-compression';
import vueDevTools from 'vite-plugin-vue-devtools';

type Algorithm = 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw';
interface Config {
  threshold: number;
  filter: (path: string) => boolean;
  deleteOriginFile: boolean;
  ext?: string;
  algorithm?: Algorithm;
}

/**
 * 创建压缩插件配置
 * @param compress - 压缩算法类型，支持 'gzip'、'brotli'、'deflate'、'deflateRaw'，传入 'none' 则不启用压缩
 * @returns 返回 vite-plugin-compression 插件实例或 null（不启用压缩）
 */
function configCompressPlugin(compress: string) {
  // 如果传入的是 'none'，表示不启用任何压缩插件
  if (compress === 'none') {
    return null;
  }

  // 通用的压缩配置
  const config: Config = {
    // 文件大小大于该值（单位：字节）才会被压缩，10240 字节 = 10KB
    threshold: 10240,

    // 指定要压缩的文件类型，匹配 js/css/html/json/xml/svg/wasm/woff/woff2
    filter: (file) => {
      return /\.(?:js|css|html|json|xml|svg|wasm|woff|woff2)$/.test(file);
    },

    // 是否删除原始未压缩的文件，false 表示保留源文件
    deleteOriginFile: false,
  };

  // 如果指定的是 'brotli' 压缩算法，则设置相应参数
  if (compress === 'brotli') {
    config.ext = '.br'; // 设置压缩文件后缀名为 .br
    config.algorithm = 'brotliCompress'; // 使用 Node.js 内置的 brotliCompress 算法
  }

  // 使用指定配置创建并返回 vite-plugin-compression 插件实例
  return compressPlugin(config);
};

/**
 * 生成版本文件插件
 * 功能：构建时向产物目录写入 version.json（内容为 package.json 的 version），
 * 供 version-rocket 的 checkVersion 轮询比对，检测线上是否发布了新版本
 * 替代 version-rocket 的 generate-version-file 命令行工具，且输出目录自动跟随 outDir 配置
 */
function versionFilePlugin(): Plugin {
  return {
    name: 'generate-version-file',
    // 仅在 build 时生效，dev 不需要
    apply: 'build',
    generateBundle() {
      const { version } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf-8'));

      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        // external 字段保持与 generate-version-file 的输出格式一致
        source: JSON.stringify({ version, external: '' }),
      });
    },
  };
}

// 创建 Vite 插件
export default function createVitePlugins(env: any) {
  return [
    vue(),
    vueJsx(),
    UnoCSS(),
    configCompressPlugin(env.VITE_COMPRESSION),
    versionFilePlugin(),
    vueDevTools(),
  ];
}

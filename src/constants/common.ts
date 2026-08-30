export interface FileStoragePlatform {
  'local-1': string;
  'aliyun-oss-1': string;
  'qiniu-kodo-1': string;
}

export type Platform = keyof FileStoragePlatform;

// 文件存储平台
export const fileStoragePlatform: FileStoragePlatform = {
  'local-1': '本地',
  'aliyun-oss-1': '阿里',
  'qiniu-kodo-1': '七牛',
};

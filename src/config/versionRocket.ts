import { checkVersion } from 'version-rocket';
import { version } from '../../package.json';

export default function () {
  const { VITE_APP_NAME, VITE_PUBLIC_PATH, MODE } = import.meta.env;

  checkVersion({
    // 3分钟检测一次版本
    pollingTime: 180000,
    // 版本号
    localPackageVersion: version,
    // 版本文件地址
    originVersionFileUrl: `${location.origin}${VITE_PUBLIC_PATH}version.json`,
    enable: MODE === 'prod',
  }, {
    title: VITE_APP_NAME,
    description: '检测到新版本',
    buttonText: '立即更新',
    primaryColor: '#758AFD',
  });
}

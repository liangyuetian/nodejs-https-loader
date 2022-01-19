import { get } from 'https';

export function resolve(specifier, context, defaultResolve) {
  const { parentURL = null } = context;

  // 通常，Node.js 会在以 'https://' 开头的说明符上出错，
  // 因此此钩子会拦截它们并将它们转换为绝对 URL，
  // 以便传给下面的后面的钩子。
  if (specifier.startsWith('https://')) {
    return {
      url: specifier
    };
  } else if (parentURL && parentURL.startsWith('https://')) {
    return {
      url: new URL(specifier, parentURL).href
    };
  }

  // 让 Node.js 处理所有其他说明符。
  return defaultResolve(specifier, context, defaultResolve);
}

export function load(url, context, defaultLoad) {
  // 要通过网络加载 JavaScript，
  // 则需要获取并返回它。
  if (url.startsWith('https://')) {
    return new Promise((resolve, reject) => {
      get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({
          // 本示例假设所有网络提供的 JavaScript 
          // 都是 ES 模块代码。
          format: 'module',
          source: data,
        }));
      }).on('error', (err) => reject(err));
    });
  }

  // 让 Node.js 处理所有其他 URL。
  return defaultLoad(url, context, defaultLoad);
}

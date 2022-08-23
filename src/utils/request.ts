import fetch, { RequestInit, Response, BodyInit } from 'node-fetch';
import qs from 'qs';
import { GITLAB_AUTH_TOKEN, GITLAB_OPEN_API } from '../constants';
import log from './log';

// export const post = config => {
//   return fetch('', {
//     method: 'post',
//     headers: {
//       'PRIVATE-TOKEN': GITLAB_AUTH_TOKEN,
//     },
//   });
// };

/**
 * @name 请求配置数据模型，继承于RequestInit
 * @interface RequestConfig
 * @extends {RequestInit}
 */
interface RequestConfig extends RequestInit {
  /** 请求地址 */
  url: string;
  /** 请求参数，一般用于query拼接 */
  params?: Record<string, any>;
  /** 是否编码请求参数中的特殊字符 */
  encodeParams?: boolean;
}

/**
 * @name Get请求封装函数
 * @param config
 */
export const get = <T>(config: RequestConfig) => {
  const { url, params, encodeParams = true, headers, ...restProps } = config;
  let queryStr = '';

  // 如果存在请求参数就格式化参数集
  if (params) {
    queryStr = qs.stringify(params, { addQueryPrefix: true, encode: encodeParams });
  }

  // log.debug(params ? GITLAB_OPEN_API + url + queryStr : GITLAB_OPEN_API + url);

  // 如果存在请求参数就拼接在请求地址后面，反之就是默认请求地址
  return fetch(params ? GITLAB_OPEN_API + url + queryStr : GITLAB_OPEN_API + url, {
    ...restProps,
    method: 'get',
    headers: {
      'PRIVATE-TOKEN': GITLAB_AUTH_TOKEN,
      ...headers,
    },
  }).then(async resp => {
    const result: T = await resp.json();
    // @ts-ignore
    const { error } = result;
    if (error) {
      const err = new Error(error);
      return Promise.reject(err);
    }
    return result;
  });
};

const TOKEN = ENV_BOT_TOKEN;//机器人token
const WEBHOOK = '/endpoint';//URL接口后缀
const SECRET = ENV_BOT_SECRET;//密钥
// api接口转化
function apiUrl(method, params = null) {
  let query = '';
  if (params) {
    query = new URLSearchParams(params).toString();
  }
  const result = `https://api.telegram.org/bot${TOKEN}/${method}?${query}`;

  return result
}
// fetch get封装
async function fetchGet(method, params = null) {
  await fetch(apiUrl(method, params));
}
addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname == WEBHOOK) {
    // 进入机器人数据处理程序
    e.respondWith();
  } else if (url.pathname == '/reg') {
    // 机器人webhook注册
    e.respondWith();
  } else if (url.pathname == '/remove') {
    // 机器人webhook注销
    e.respondWith();
  }
})
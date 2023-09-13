// 机器人token
const TOKEN = ENV_BOT_TOKEN
// 机器人请求的URL接口后缀
const WEBHOOK = '/endpoint'
// 密钥
const SECRET = ENV_BOT_SECRET // A-Z, a-z, 0-9, _ and -

/**
 * Router of the work
 * 工作路由
 */
addEventListener('fetch', event => {
  // 获取请求的URL
  const url = new URL(event.request.url)

  // 机器人的请求处理
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))

    // 机器人的webhook注册
  } else if (url.pathname === '/reg') {
    event.respondWith(registerWebhook(url, WEBHOOK, SECRET))

    // 机器人的webhook注销
  } else if (url.pathname === '/remove') {
    event.respondWith(unRegisterWebhook())

    // 404
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

/**
 * Handle requests to WEBHOOK
 * 机器人的请求处理
 * https://core.telegram.org/bots/api#update
 */
async function handleWebhook(event) {
  // Check secret 检查密钥
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized 未授权', { status: 403 })
  }

  // 处理传入的数据
  event.waitUntil(onUpdate(event))

  return new Response('Ok')
}

/**
 * Handle incoming Update
 * 处理传入的update数据
 * https://core.telegram.org/bots/api#update
 */
async function onUpdate(data) {

  const update = await data.request.json()

  if ('message' in update) {
    return await onMessage(update.message)
  }
}

/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
async function onMessage(message) {
  let data = {
    "method": "sendMessage",
    "chat_id": message.chat.id,
    "text": '🎁客服🎁:\n' + message.text + '\n' + message.chat.id
  }
  await fPost(data)
  const chatId = message.chat.id
  const text1 = '' + apiUrl('sendMessage', {
    chat_id: chatId,
    text: 'hello'
  })
  return await sendPlainText(chatId, text1)
}

/**
 * Send plain text message
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendPlainText(chatId, text) {
  // return await fetch(apiUrl('sendMessage', {
  //   chat_id: chatId,
  //   text
  // }))
  await aFetch('sendMessage', {
    chat_id: chatId,
    text
  })
}

/**
 * Set webhook to this worker's url
 * https://core.telegram.org/bots/api#setwebhook
 */
async function registerWebhook(requestUrl, suffix, secret) {
  // https://core.telegram.org/bots/api#setwebhook
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: secret }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Remove webhook
 * https://core.telegram.org/bots/api#setwebhook
 */
async function unRegisterWebhook() {
  const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Return url to telegram api, optionally with parameters added
 */
function apiUrl(methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}
/**
 * fetch的封装函数
 */
async function aFetch(methodName, params = null) {
  await fetch(apiUrl(methodName, params));
}
async function fPost(payload) {
  const data = {
    "method": 'post',
    "payload": payload
  }

  await fetch(apiUrl(payload.method, data), data)
}
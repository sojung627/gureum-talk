export function notificationsSupported(): boolean {
  return window.isSecureContext && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported'
}

async function notificationWorker() {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      (async () => {
        const registration = await navigator.serviceWorker.register('/notification-worker.js')
        return registration.active ? registration : await navigator.serviceWorker.ready
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Notification worker activation timed out')), 5_000)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export async function enableNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  const permission = await Notification.requestPermission()
  console.info('[GureumTalk notifications] permission', permission)
  return permission
}

export async function showAnswerNotification(
  roomId: number,
  title: string,
  body: string,
  shouldNotify: () => boolean,
): Promise<boolean> {
  return showSystemNotification(title, body, `/chat?room=${roomId}`, `gureumtalk-answer-${roomId}`, shouldNotify)
}

export async function showTestNotification(title: string, body: string): Promise<boolean> {
  return showSystemNotification(title, body, '/features', 'gureumtalk-test', () => true)
}

async function showSystemNotification(
  title: string, body: string, url: string, tag: string, shouldNotify: () => boolean,
): Promise<boolean> {
  const permission = notificationPermission()
  if (permission !== 'granted' || !shouldNotify()) {
    console.info('[GureumTalk notifications] skipped', { permission })
    return false
  }
  const options: NotificationOptions = {
    body,
    icon: '/images/gureum/GureumAI.png',
    tag,
    data: { url },
  }
  try {
    if ('serviceWorker' in navigator) {
      const registration = await notificationWorker()
      // The user may turn notifications off while the worker activates.
      if (notificationPermission() === 'granted' && shouldNotify()) {
        await registration.showNotification(title, options)
        console.info('[GureumTalk notifications] sent via service worker')
        return true
      }
    } else if (shouldNotify()) {
      const notification = new Notification(title, options)
      notification.onclick = () => {
        window.focus()
        window.location.assign(url)
        notification.close()
      }
      console.info('[GureumTalk notifications] sent via Notification API')
      return true
    }
  } catch (error) {
    console.warn('[GureumTalk notifications] service worker notification failed', error)
    // Desktop browsers can still notify if worker registration or activation fails.
    if (notificationPermission() === 'granted' && shouldNotify()) {
      try {
        const notification = new Notification(title, options)
        notification.onclick = () => {
          window.focus()
          window.location.assign(url)
          notification.close()
        }
        console.info('[GureumTalk notifications] sent via fallback')
        return true
      } catch (fallbackError) {
        console.error('[GureumTalk notifications] delivery failed', fallbackError)
      }
    }
  }
  return false
}

export async function closeAnswerNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.getRegistration('/notification-worker.js')
    const notifications = await registration?.getNotifications()
    notifications?.forEach(notification => notification.close())
  } catch {
    // Disabling future notifications still works if the browser cannot close old ones.
  }
}

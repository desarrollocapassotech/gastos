import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz para montar la aplicación.')
}

createRoot(rootElement).render(<App />)

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')

    const notifyWaitingWorker = () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      if (!newWorker) {
        return
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          notifyWaitingWorker()
        }
      })
    })

    if (registration.waiting) {
      notifyWaitingWorker()
    }

    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)
  } catch (error) {
    console.error('Error al registrar el service worker:', error)
  }
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshing = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) {
      return
    }

    refreshing = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    registerServiceWorker()
  })
}
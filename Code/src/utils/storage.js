export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`storage.getItem failed for "${key}"`, err)
    return fallback
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`storage.setItem failed for "${key}"`, err)
    return false
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn(`storage.removeItem failed for "${key}"`, err)
  }
}

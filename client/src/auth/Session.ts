
export interface SessionType {
    accessToken: string | null,
    refreshToken: string | null,
    email: string | null,
    id: string | null,
    userType: string | null,
}

export const session: SessionType = {
    accessToken: null,
    refreshToken: null,
    email: null,
    id: null,
    userType: null,
}

type SessionListener = (session: SessionType) => void
const listeners: SessionListener[] = []

const notifySessionChanged = () => {
    listeners.forEach(listener => listener(session))
}

export const subscribeSession = (listener: SessionListener) => {
    listeners.push(listener)
    return () => {
        const idx = listeners.indexOf(listener)
        if (idx !== -1) {
            listeners.splice(idx, 1)
        }
    }
}

export const logout = () => {
    session.email = null
    session.id = null
    session.accessToken = null
    session.refreshToken = null
    session.userType = null
    localStorage.removeItem('user')
    notifySessionChanged()
}

export const login = (data: any) => {
    session.email = data.user.email
    session.id = data.user.id
    session.accessToken = data.access_token
    session.refreshToken = data.refresh_token
    session.userType = data.user.type ?? 'user'
    localStorage.setItem('user', JSON.stringify(session))
    notifySessionChanged()
}

export const saveSession = () => {
    localStorage.setItem('user', JSON.stringify(session))
}

export const loadSession = () => {
    if (session.email) {
        return
    }
    const entry = localStorage.getItem('user')
    if (!entry) {
        return
    }
    const user = JSON.parse(entry)
    if (user) {
        session.email = user.email
        session.id = user.id
        session.accessToken = user.accessToken
        session.refreshToken = user.refreshToken
        session.userType = user.userType ?? null
        notifySessionChanged()
    }
}

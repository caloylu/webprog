
export interface SessionType {
    accessToken: string | null,
    refreshToken: string | null,
    email: string | null,
    id: string | null,
}

export const session: SessionType = {
    accessToken: null,
    refreshToken: null,
    email: null,
    id: null,
}

export const logout = () => {
    session.email = null
    session.id = null
    session.accessToken = null
    session.refreshToken = null
    localStorage.removeItem('user')
}

export const login = (data: any) => {
    session.email = data.user.email
    session.id = data.user.id
    session.accessToken = data.access_token
    session.refreshToken = data.refresh_token
    localStorage.setItem('user', JSON.stringify(session))
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
    }
}

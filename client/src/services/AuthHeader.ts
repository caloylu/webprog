import { session } from "../auth/Session";

export default function authHeader() {
    const user = session
    console.log(user)
    if (user && user.accessToken) {
        return { Authorization: `Bearer ${user.accessToken}` };
    } else {
        return {};
    }
}
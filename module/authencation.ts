import axios, { AxiosInstance } from "axios";

export async function loginSession(
    username: string,
    password: string,
    session: AxiosInstance
): Promise<AxiosInstance | null> {
    const payload = `pwMenuId=&pwMenuUrl=&trmnlIdntNo=&gcmRegId=&osKnd=&osVer=&dpi=&rsotnHrzn=&rsotnVrtc=&modelNo=&ipInfo=&loginId=${username}&loginPw=${password}`;

    try {
        await session.post("https://student.cnsa.hs.kr/login/userLogin", payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return session;
    } catch (error) {
        console.error(error);
        return null;
    }
}
export function logoutSession(session: AxiosInstance) {
    session.get("https://student.cnsa.hs.kr/login/logout");
    return true;
}
export async function checkAccountAlreadyLoggedIn(username: string) {
    // return true if already logged in, false if not
    try {
        const {data} = await axios.get(`https://student.cnsa.hs.kr/login/dupLoginCheck?loginId=${username}&dummy=${Math.round(Math.random() * 100000)}`)
        return data !== ""
    } catch {
        return false;
    }
}
checkAccountAlreadyLoggedIn("S220126").then(console.log)
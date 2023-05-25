import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export function makeSession() {
	const jar = new CookieJar();
	const client = wrapper(
		axios.create({ jar, baseURL: "https://student.cnsa.hs.kr" })
	);
    return client
}

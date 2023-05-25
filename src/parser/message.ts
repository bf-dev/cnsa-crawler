import { AxiosInstance } from "axios";
import { load } from "cheerio";
import crypto from "crypto";
interface Message {
    id: string;
    author: string;
    content: string;
    created_at: Date;
}

function parseMessages(data: string): Message[] {
    const messages: Message[] = [];
    const $ = load(data);
    $("table.tableBasicList tbody tr").each((_index, element) => {
        const author = $(element).find("td:nth-child(6) a").text().trim();
        const date = $(element).find("td:nth-child(7)").text().trim();
        const created_at = new Date(date);
        const content = $(element).find("td.title_td p").text().trim();
        const id = crypto.createHash("md5").update(`${content}`).digest("hex");
        messages.push({ id, author, content, created_at });
    });
    return messages;
}
export async function getMessages(session:AxiosInstance) {
    try {
        const messagesResponse = await session.get(
            "/teacher/memo/selectMemoList?pageNo=1&maxRowPerPage=10&sendrId=&srsNo=&searchMemo=0&searchStdntNm=&_searchCnfChk=on&searchCntNt="
        );
        if(messagesResponse.data.includes("ajaxLoginError")) return [];
        const messages = parseMessages(messagesResponse.data);
        return messages;
    } catch (err) {
        console.error(err);
        return [];
    }
}
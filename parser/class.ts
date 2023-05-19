import { AxiosInstance } from "axios";
import { load } from "cheerio";


export async function getClass(session: AxiosInstance) {
    const { data } = await session.get("/subject/curriculum/curriculumList");
    if (data.includes("ajaxLoginError")) return null;
    const $ = load(data);
    return $(".tableBasicList tbody tr").map((_a, element) => {
        const $tds = $(element).find("td");
        const href = $tds.eq(1).find("a").attr("href")!;
        const [_b, classCode, classNumber] = href.match(/goSubjectList\('(.*)', '(.*)'\)/)!;
        return {
            classId: `${classCode}_${classNumber}`,
            className: $tds.eq(1).text().trim(),
            teacher: $tds.eq(2).text().trim(),
            assignmentCount: $tds.eq(3).text().trim(),
        };
    }).toArray();
}

import { AxiosInstance } from "axios";
import { load } from "cheerio";
export interface PostInfo {
    postTitle: string;
    postContent: string;
    files: {
        fileName: string | undefined;
        fileUrl: string | undefined;
    }[];
}
export async function getPostInfo(session: AxiosInstance, postId: string) : Promise<PostInfo | null> {
	try {
		const [classCode, classNumber, srsNo] = postId.split("_");
		const htmlContent = await session.get(
			`/subject/curriculum/subjectActivityReportView?estblSubjId=${classCode}&clsSrsNo=${classNumber}&srsNo=${srsNo}`
		);
		const $ = load(htmlContent.data);
		const postTitle = $(".tableBasicView tbody tr")
			.eq(2)
			.find("td")
			.eq(0)
			.text();
		const postContent = $(".tableBasicView tbody tr")
			.eq(3)
			.find("td")
			.eq(0)
			.text()
		const files = $(".tableBasicView tbody tr")
			.eq(4)
			.find("a")
			.map((_, element) => {
				const $element = $(element);
				return {
					fileName: $element.text(),
					fileUrl: $element.attr("href"),
				};
			})
			.get();
        
		return { postTitle, postContent, files };
	} catch (e) {
		return null;
	}
}

import { load } from "cheerio";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { CookieJar } from "tough-cookie";

interface Post {
	postId: string;
	postTitle: string;
	postDate: string;
	assignmentStatus: string;
	assignmentDue: string;
}

export async function getClassBoard(
	session: AxiosInstance,
	classId: string
): Promise<Post[] | null> {
	const classCode = classId.toString().split("_")[0];
	const classNumber = classId.toString().split("_")[1];

	const result: AxiosResponse = await session.get(
		`/subject/curriculum/subjectList?estblSubjId=${classCode}&clsSrsNo=${classNumber}`
	);
	if(result.data.includes("ajaxLoginError")) return null;
	const $ = load(result.data);
	const classPosts = $(".tableBasicList tbody tr")
		.map((_, element) => {
			const $element = $(element);
			const postId = `${classId}_${$element.find("td").eq(0).text()}`;
			const postTitle = $element.find("td").eq(2).text().replace(/\n/g, "").replace(/\t/g, "");
			const postDate = $element.find("td").eq(3).text().replace(/\n/g, "").replace(/\t/g, "");
			const assignmentStatus = $element.find("td").eq(4).text().replace(/\n/g, "").replace(/\t/g, "");
			const assignmentDue = $element.find("td").eq(5).text().replace(/\n/g, "").replace(/\t/g, "");
			return {
				postId,
				postTitle,
				postDate,
				assignmentStatus,
				assignmentDue,
			};
		})
		.get();

	return classPosts;
}

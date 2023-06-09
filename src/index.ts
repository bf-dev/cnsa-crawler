import { QueueItem, QueueItemType } from "./type/queue";
import { makeSession } from "./module/session";
import {
	checkAccountAlreadyLoggedIn,
	loginSession,
	logoutSession,
} from "./module/authencation";
import { getClass } from "./parser/class";
import { getClassBoard } from "./parser/class_board";
import { PostInfo, getPostInfo } from "./parser/class_post";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getTimetable } from "./parser/timetable";
import { getMessages } from "./parser/message";
config();

const client = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_KEY!
);

export const crawlData = async (req: any, res: any) => {
	const task: QueueItem = req.body as QueueItem;
	const result = await (async () => {
		const username = task.username;
		const password = task.password;
		const uuid = task.uuid;
		if (task.type !== QueueItemType.FORCE) {
			if (await checkAccountAlreadyLoggedIn(username)) {
				return { success: false, message: "이미 로그인되어 있습니다." };
			}
		}

		const session = makeSession();

		const login = await loginSession(username, password, session);
		if (!login)
			return { success: false, message: "로그인에 실패했습니다." };

		const classes = await getClass(login);
		if (!classes) {
			logoutSession(login);
			return {
				success: false,
				message: "수업을 가져오는데 실패했습니다.",
			};
		}
		await client
			.from("caches")
			.upsert({
				id: uuid,
				type: "class",
				data: classes,
			})
			.then(console.log);
		const classBoards = await Promise.all(
			classes.map(async (classInfo) => {
				return getClassBoard(login, classInfo.classId);
			})
		);
		classBoards.forEach(async (classBoard, index) => {
			await client.from("caches").upsert({
				id: uuid,
				type: `class_board_${classes[index].classId}`,
				data: classBoard,
			});
		});

		if (classBoards.includes(null)) {
			logoutSession(login);
			return {
				success: false,
				message: "게시판을 가져오는데 실패했습니다.",
			};
		}
		const posts: PostInfo[] = [];
		for (const classBoard of classBoards) {
			for (const postId of classBoard!) {
				if (!postId) continue;
				const postInfo = await getPostInfo(login, postId.postId);
				if (!postInfo) continue;
				posts.push(postInfo);
				await client.from("caches").upsert({
					id: uuid,
					type: `class_post_${postId.postId}`,
					data: postInfo,
				});
			}
		}
		const timetable = await getTimetable(login);
		if (!timetable) {
			return {
				success: false,
				message: "시간표를 가져오는데 실패했습니다.",
			};
		}
		await client
			.from("timetable")
			.upsert({
				id: uuid,
				timetable: timetable,
			})
			.then(console.log);
		console.log(timetable);
		const messages = await getMessages(login);
		console.log(messages);
		messages.forEach(async (message) => {
			await client
				.from("messages")
				.upsert({
					...message,
					owner: uuid,
				})
				.then(console.log);
		});

		logoutSession(login);
		return {
			success: true,
			message: "성공적으로 큐를 처리했습니다.",
		};
	})();
	res.send(result);
};

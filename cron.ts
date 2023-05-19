import { CronJob } from "cron";

import { addQueue } from ".";
import { QueueItemType } from "./type/queue";
import { createClient } from "@supabase/supabase-js";
const client = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_KEY!
);
// Define a cron job that runs every 2 hours
const job = new CronJob("0 */2 * * *", async () => {
	console.log("Running cron job...");
	try {
		// Fetch data from Supabase
		const { data: accounts, error } = await client
			.from("accounts")
			.select("*");

		if (error) {
			throw error;
		}

		// Add each account to the queue
		accounts.forEach((account: any) => {
			addQueue({
				type: QueueItemType.DEFAULT,
				username: account.username,
				password: account.password,
				uuid: account.id,
			});
		});
	} catch (error) {
		console.error(error);
	}
});

// Start the cron job
job.start();

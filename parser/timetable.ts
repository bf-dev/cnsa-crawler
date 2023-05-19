import { AxiosInstance } from "axios";
import { load } from 'cheerio';

export async function getTimetable(session: AxiosInstance): Promise<object | null> {
    try {
        const response = await session.get('/subject/schedule/personalTimetableLookup');
        const timetableHtml = response.data;
        const $ = load(timetableHtml);
        const timetable: {[key: number]: {[key: string]: string}} = {};
        $('#timeTable tbody tr').each((index, element) => {
            const time = [
                'Breakfast',
                '1',
                '2',
                '3',
                '4',
                'Lunch',
                '5',
                '6',
                '7',
                null,
                'ET',
                'Dinner',
                'EP1',
                'EP2',
                null,
                null,
            ][index];
            if (time) {
                $(element).find('td').each((index, item) => {
                    if (index == 0 || index == 6 || index == 7) return;
                    const subject = $(item).text().trim().replace(/\t/g, '');
                    if (subject) {
                        if (!timetable[index]) {
                            timetable[index] = {};
                        }
                        timetable[index]![time] = subject;
                    }
                });
            }
        });
        return timetable;
    } catch (error) {
        console.error(error);
        return null;
    }
}
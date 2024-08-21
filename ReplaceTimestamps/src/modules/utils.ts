import { get } from "enmity/api/settings";

export const getUnixTimestamp = ({ str, format, dateRegexMatch, timeRegexMatch }: { str: string, format?: string, dateRegexMatch: RegExp, timeRegexMatch: RegExp }) => {
    const timeMatch = str.match(timeRegexMatch);
    const dateMatch = str.match(dateRegexMatch);

    const formatParts = (get("dateFormat", "dd.MM.yyyy") as string).split(/[./]/);
    let dayIndex: number, monthIndex: number, yearIndex: number;
    formatParts.forEach((part, index) => {
        if (part.includes("dd")) dayIndex = index;
        if (part.includes("MM")) monthIndex = index;
        if (part.includes("yyyy")) yearIndex = index;
    });

    let date = new Date();
    if (dateMatch) {
        const day = parseInt(dateMatch[dayIndex + 1]);
        const month = parseInt(dateMatch[monthIndex + 1]);
        const year = parseInt(dateMatch[yearIndex + 1]);
        date = new Date(year, month - 1, day);
    }

    let time = date;
    if (timeMatch) {
        let [hours, minutes] = timeMatch[1].split(":").map(e => parseInt(e));
        if (timeMatch[2] && timeMatch[2].toLowerCase() === "pm" && hours < 12 && hours !== 0) {
            hours += 12;
            // @ts-ignore
            minutes = minutes.toString().padStart(2, "0");
        } else if ((timeMatch[2] && timeMatch[2].toLowerCase() === "am" && hours === 12) || (hours === 24)) {
            hours = 0;
        } else if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            // @ts-ignore
            minutes = (minutes % 60).toString().padStart(2, "0");
        }
        time = new Date(date);
        time.setHours(hours);
        time.setMinutes(minutes);
    }

    const then = Math.round(time.getTime() / 1000);
    if (isNaN(then)) return str;
    return `<t:${then}${format ? `:${format}` : ""}>`;
};

export const getRelativeTime = ({ str, relativeRegexMatch }: { str: string, relativeRegexMatch: RegExp }) => {
    const timeMatch = str.match(relativeRegexMatch);
    if (!timeMatch) return str;

    const now = new Date();
    let future = false;
    let value: number, unit: string;

    if (timeMatch[1] && timeMatch[2]) {
        value = parseInt(timeMatch[1]);
        unit = timeMatch[2];
        future = true;
    } else if (timeMatch[3] && timeMatch[4]) {
        value = parseInt(timeMatch[3]);
        unit = timeMatch[4];
        future = false;
    }

    if (isNaN(value)) return str;

    const adjustDate = (date: Date, value: number, unit: string, future: boolean) => {
        switch (unit.toLowerCase()) {
            case "s":
                date.setSeconds(date.getSeconds() + (future ? value : -value));
                break;
            case "m":
                date.setMinutes(date.getMinutes() + (future ? value : -value));
                break;
            case "h":
                date.setHours(date.getHours() + (future ? value : -value));
                break;
            case "d":
                date.setDate(date.getDate() + (future ? value : -value));
                break;
            case "w":
                date.setDate(date.getDate() + (future ? value * 7 : -value * 7));
                break;
            case "mo":
                date.setMonth(date.getMonth() + (future ? value : -value));
                break;
            case "y":
                date.setFullYear(date.getFullYear() + (future ? value : -value));
                break;
        }
        return date;
    };

    const adjustedDate = adjustDate(now, value, unit, future);
    const then = Math.round(adjustedDate.getTime() / 1000);

    return `<t:${then}:R>`;
};

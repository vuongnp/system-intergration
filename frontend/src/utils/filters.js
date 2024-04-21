import { TIME_FORMAT } from "./constants";
import moment from "moment"
export function trimNameFile(name) {
    if (name.length <= 20) return name;
    else return name.slice(0, 20) + "...";
}
export function shortTime(value) {
    return moment(value).format(TIME_FORMAT.SHORT_FULL_TIME);
}
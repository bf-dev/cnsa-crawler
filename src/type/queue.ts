export enum QueueItemType {
    DEFAULT = "DEFAULT",
    FORCE = "FORCE"
}
export enum Task {
    LOGIN,
    LOGOUT,
    CHECK,
    CLASS_BOARD,
    CLASS_POST,
    CLASS,
    INTERNAL_BOARD,
    INTERNAL_POST,
    TIMETABLE,
    MESSAGE,
}

export interface QueueItem {
    type: QueueItemType;
    username: string;
    password: string;
    uuid: string;
}
export interface CustomBadges {
    [key: string]: string[];
}

export interface BadgeCache {
    badges: CustomBadges;
    expires: number;
}
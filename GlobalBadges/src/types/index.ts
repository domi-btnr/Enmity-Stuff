export interface CustomBadges {
    aliu: {
        dev: boolean;
        donor: boolean;
        contributor: boolean;
        custom: {
            url: string;
            text: string;
        };
    };
    bd: {
        dev: boolean;
    };
    enmity: {
        supporter: {
            data: {
                name: string;
                id: string;
                url: {
                    dark: string;
                    light: string;
                };
            };
        };
    };
    goosemod: {
        sponsor: boolean;
        dev: boolean;
        translator: boolean;
    };
}

export interface BadgeCache {
    badges: CustomBadges;
    expires: number;
}
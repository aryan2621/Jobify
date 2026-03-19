export class Subscription {
    id!: string;
    createdAt!: string;
    type!: SubscriptionType;
    videosCount!: number;

    constructor(json: Partial<Subscription>) {
        Object.assign(this, json);
    }
}
export enum SubscriptionType {
    BASIC = 'basic',
    PRO = 'pro',
    
    ENTERPRISE = 'enterprise',
}

export const subscriptionPrices = {
    [SubscriptionType.BASIC]: 999,
    [SubscriptionType.PRO]: 2499,
    
    [SubscriptionType.ENTERPRISE]: 0,
};

export const subscriptionLimits = {
    [SubscriptionType.BASIC]: 30,
    [SubscriptionType.PRO]: 200,
    
    [SubscriptionType.ENTERPRISE]: 1000,
};

export const yearlySubscriptionPrices = {
    [SubscriptionType.BASIC]: 9990,
    [SubscriptionType.PRO]: 24990,
    
    [SubscriptionType.ENTERPRISE]: 0,
};

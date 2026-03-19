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
    ENTERPRISE = 'enterprise'
}
export const subscriptionPrices = {
    [SubscriptionType.BASIC]: 499,
    [SubscriptionType.PRO]: 999,
    [SubscriptionType.ENTERPRISE]: 0,
};
export const subscriptionLimits = {
    [SubscriptionType.BASIC]: 75,
    [SubscriptionType.PRO]: 150,
    [SubscriptionType.ENTERPRISE]: 1000,
};
export const yearlySubscriptionPrices = {
    [SubscriptionType.BASIC]: 4990,
    [SubscriptionType.PRO]: 9990,
    [SubscriptionType.ENTERPRISE]: 0,
};

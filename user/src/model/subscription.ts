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
    /**
     * @description Contact sales for enterprise plan
     */
    ENTERPRISE = 'enterprise',
}
/**
 * @description The price of the subscription per month (INR).
 */
export const subscriptionPrices = {
    [SubscriptionType.BASIC]: 499,
    [SubscriptionType.PRO]: 999,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 0,
};
/**
 * @description The maximum number of videos a user can upload per month.
 */
export const subscriptionLimits = {
    [SubscriptionType.BASIC]: 75,
    [SubscriptionType.PRO]: 150,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 1000,
};
/**
 * @description The price of the subscription per year (INR).
 */
export const yearlySubscriptionPrices = {
    [SubscriptionType.BASIC]: 4990,
    [SubscriptionType.PRO]: 9990,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 0,
};

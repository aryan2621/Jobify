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
 * @description The price of the subscription per month.
 */
export const subscriptionPrices = {
    [SubscriptionType.BASIC]: 25,
    [SubscriptionType.PRO]: 50,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 100,
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
export const yearlySubscriptionPrices = {
    [SubscriptionType.BASIC]: 125,
    [SubscriptionType.PRO]: 250,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 500,
};

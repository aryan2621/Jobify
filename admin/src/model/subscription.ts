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
    [SubscriptionType.BASIC]: 999,
    [SubscriptionType.PRO]: 2499,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 0,
};
/**
 * @description The maximum number of job postings per month.
 */
export const subscriptionLimits = {
    [SubscriptionType.BASIC]: 30,
    [SubscriptionType.PRO]: 200,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 1000,
};
/**
 * @description Yearly subscription prices (INR), ~17% off monthly.
 */
export const yearlySubscriptionPrices = {
    [SubscriptionType.BASIC]: 9990,
    [SubscriptionType.PRO]: 24990,
    /**
     * @description Contact sales for enterprise plan
     */
    [SubscriptionType.ENTERPRISE]: 0,
};

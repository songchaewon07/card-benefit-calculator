import subscriptionsSeed from "../../../data/subscriptions.seed.json";
import type { SubscriptionService } from "./types";

export const subscriptionServices: SubscriptionService[] =
  subscriptionsSeed as SubscriptionService[];

export const TRIAL_DAYS = 15;

export function isGestor(user) {
  return user?.role === 'admin';
}

export function isPremium(user) {
  return user?.subscription_status === 'active' || isGestor(user);
}

export function trialDaysLeft(user) {
  if (!user?.trial_start) return null;
  const start = new Date(user.trial_start).getTime();
  const end = start + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const left = Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
  return left;
}

export function isTrialActive(user) {
  const left = trialDaysLeft(user);
  if (left === null || left > TRIAL_DAYS) return false;
  return left > 0;
}

export function hasAccess(user) {
  if (!user) return false;
  return isPremium(user) || !user.trial_start || isTrialActive(user);
}
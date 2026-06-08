type GenerateTripRequest = {
  destination: string;
  days: string;
  interests: string;
  budget: string;
};

type ModifyTripRequest = {
  currentPlan: any;
  message: string;
};

const BASE_URL = 'http://192.168.8.164:8000';

function parseBudgetAmount(budget?: string) {
  if (!budget) return 0;

  const normalizedBudget = budget
    .replace(/\s/g, '')
    .replace(',', '.')
    .match(/\d+(\.\d+)?/);

  return normalizedBudget ? Number(normalizedBudget[0]) : 0;
}

function hasBudgetBreakdown(plan: any) {
  return (
    plan?.kulut &&
    typeof plan.kulut === 'object' &&
    Object.values(plan.kulut).some((value) => Number(value) > 0)
  );
}

function createBudgetBreakdown(totalBudget: number) {
  if (!totalBudget) return undefined;

  return {
    majoitus: Math.round(totalBudget * 0.4),
    ruoka: Math.round(totalBudget * 0.25),
    aktiviteetit: Math.round(totalBudget * 0.2),
    liikkuminen: Math.round(totalBudget * 0.15),
  };
}

function withBudgetBreakdown(plan: any, budget?: string) {
  if (hasBudgetBreakdown(plan)) return plan;

  const totalBudget = Number(plan?.budjetti) || parseBudgetAmount(budget);
  const kulut = createBudgetBreakdown(totalBudget);

  if (!kulut) return plan;

  return {
    ...plan,
    budjetti: totalBudget,
    kulut,
  };
}

export async function generateTripPlan({
  destination,
  days,
  interests,
  budget,
}: GenerateTripRequest) {
  const response = await fetch(`${BASE_URL}/generate-trip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination,
      days: Number(days),
      interests,
      budget,
    }),
  });

  if (!response.ok) {
    throw new Error('Backend palautti virheen');
  }

  const data = await response.json();

  return withBudgetBreakdown(data, budget);
}

export async function modifyTripPlan({
  currentPlan,
  message,
}: ModifyTripRequest) {
  const response = await fetch(`${BASE_URL}/modify-trip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPlan,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error('Matkan muokkaus epäonnistui');
  }

  const data = await response.json();

  return hasBudgetBreakdown(data)
    ? data
    : {
        ...data,
        kulut: currentPlan?.kulut,
        budjetti: currentPlan?.budjetti,
      };
}

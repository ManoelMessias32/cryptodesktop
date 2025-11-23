export const economyData = {
  // Ganhos mensais recalculados com bônus de 150 BDG, e ganhos por hora ajustados.
  // gain = Ganho Mensal | gainPerHour = Ganho Mensal / 720 horas
  free: { tier: 0, gain: 250,  gainPerHour: 0.347, repairCost: 10 },    // Base 100 + 150
  1:    { tier: 1, gain: 450,  gainPerHour: 0.625, repairCost: 50 },    // Base 300 + 150
  2:    { tier: 2, gain: 750,  gainPerHour: 1.041, repairCost: 100 },   // Base 600 + 150
  3:    { tier: 3, gain: 1050, gainPerHour: 1.458, repairCost: 150 },   // Base 900 + 150
  A:    { tier: 1, gain: 1450, gainPerHour: 2.013, repairCost: 200 },  // Base 1300 + 150
  B:    { tier: 2, gain: 1650, gainPerHour: 2.291, repairCost: 250 },  // Base 1500 + 150
  C:    { tier: 3, gain: 1950, gainPerHour: 2.708, repairCost: 300 },  // Base 1800 + 150
};

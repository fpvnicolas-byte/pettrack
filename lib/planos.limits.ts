import { Plano } from '@prisma/client';

export interface PlanoLimits {
  maxAtendimentos: number | null;   // null = ilimitado
  maxProfissionais: number | null;  // null = ilimitado
  uploadMidia: boolean;
}

export const LIMITES_POR_PLANO: Record<Plano, PlanoLimits> = {
  TRIAL: {
    maxAtendimentos: 30,
    maxProfissionais: 1,
    uploadMidia: false,
  },
  BASICO: {
    maxAtendimentos: null,
    maxProfissionais: null,
    uploadMidia: false,
  },
  PROFISSIONAL: {
    maxAtendimentos: null,
    maxProfissionais: null,
    uploadMidia: true,
  },
  PREMIUM: {
    maxAtendimentos: null,
    maxProfissionais: null,
    uploadMidia: true,
  },
};

export function getLimites(plano: Plano): PlanoLimits {
  return LIMITES_POR_PLANO[plano];
}

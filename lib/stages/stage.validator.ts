import type { StageDefinition } from '@/types';

export function validateStageTransition(
  currentStage: number,
  targetStage: number,
  stages: StageDefinition[]
): { valid: boolean; error?: string } {
  // Só pode avançar para o próximo estágio
  if (targetStage !== currentStage + 1) {
    return {
      valid: false,
      error: `Transição inválida: não é possível pular do estágio ${currentStage} para ${targetStage}`,
    };
  }

  // Não pode ultrapassar o último estágio
  if (targetStage >= stages.length) {
    return {
      valid: false,
      error: `Estágio ${targetStage} não existe. Máximo: ${stages.length - 1}`,
    };
  }

  return { valid: true };
}

export function isLastStage(currentStage: number, stages: StageDefinition[]): boolean {
  return currentStage === stages.length - 1;
}

export function canAttachMedia(stage: StageDefinition): boolean {
  return stage.mediaAllowed;
}

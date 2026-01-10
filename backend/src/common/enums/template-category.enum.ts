export enum TemplateCategory {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  FUNCTIONAL = 'functional',
  FULL_BODY = 'full_body',
}

export const TemplateCategoryLabels: Record<TemplateCategory, string> = {
  [TemplateCategory.STRENGTH]: 'Fuerza',
  [TemplateCategory.HYPERTROPHY]: 'Hipertrofia',
  [TemplateCategory.ENDURANCE]: 'Resistencia',
  [TemplateCategory.CARDIO]: 'Cardio',
  [TemplateCategory.FLEXIBILITY]: 'Flexibilidad',
  [TemplateCategory.FUNCTIONAL]: 'Funcional',
  [TemplateCategory.FULL_BODY]: 'Cuerpo Completo',
};

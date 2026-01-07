export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  BANDS = 'bands',
  NONE = 'none',
}

export const EquipmentLabels: Record<Equipment, string> = {
  [Equipment.BARBELL]: 'Barra',
  [Equipment.DUMBBELL]: 'Mancuernas',
  [Equipment.MACHINE]: 'Máquina',
  [Equipment.CABLE]: 'Polea/Cable',
  [Equipment.BODYWEIGHT]: 'Peso Corporal',
  [Equipment.KETTLEBELL]: 'Kettlebell',
  [Equipment.BANDS]: 'Bandas Elásticas',
  [Equipment.NONE]: 'Sin Equipamiento',
};

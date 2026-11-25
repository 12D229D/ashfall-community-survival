/**
 * buildings.js - Módulos e Infraestructura del Refugio
 * Purificador central, Invernadero, Enfermería, Taller de máscaras.
 */

export class ShelterBuilding {
  constructor({ id, name, icon, category, description, level = 1, maxLevel = 3, workersMax = 2 }) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.category = category;
    this.description = description;
    this.level = level;
    this.maxLevel = maxLevel;
    this.workersMax = workersMax;
    this.assignedWorkers = [];
  }

  canUpgrade(resources) {
    if (this.level >= this.maxLevel) return false;
    const costMaterials = 15 * this.level;
    const costFuel = 5 * this.level;
    return resources.materials >= costMaterials && resources.fuelUnits >= costFuel;
  }

  upgrade(resources) {
    if (!this.canUpgrade(resources)) return false;
    resources.materials -= (15 * this.level);
    resources.fuelUnits -= (5 * this.level);
    this.level += 1;
    return true;
  }

  getProductionPerTick(workerCount, traitsPresent = []) {
    let output = { food: 0, water: 0, healthHeal: 0, filterWearReduction: 0 };
    if (workerCount === 0) return output;

    switch (this.id) {
      case 'purifier':
        // Reduce desgaste y purifica aire interior
        output.filterWearReduction = 0.2 * this.level * workerCount;
        if (traitsPresent.includes('mechanic_savant')) output.filterWearReduction *= 1.4;
        break;
      case 'greenhouse':
        // Producción de alimentos hidropónicos
        output.food = 0.5 * this.level * workerCount;
        if (traitsPresent.includes('botanist')) output.food *= 1.5;
        break;
      case 'clinic':
        // Asistencia médica y reducción de asfixia
        output.healthHeal = 2.0 * this.level * workerCount;
        if (traitsPresent.includes('medic_veteran')) output.healthHeal *= 1.5;
        break;
      case 'workshop':
        // Mantenimiento preventivo
        output.tools = 0.3 * this.level * workerCount;
        break;
    }
    return output;
  }
}

export function createInitialBuildings() {
  return [
    new ShelterBuilding({
      id: 'purifier',
      name: 'Purificador Central',
      icon: '💨',
      category: 'vital',
      description: 'Limpia el polvo volcánico y gases sulfurosos que entran al búnker.'
    }),
    new ShelterBuilding({
      id: 'greenhouse',
      name: 'Invernadero Hidropónico',
      icon: '🌱',
      category: 'production',
      description: 'Cultivo protegido de hortalizas y tubérculos de alta montaña.'
    }),
    new ShelterBuilding({
      id: 'clinic',
      name: 'Enfermería y Descontaminación',
      icon: '🏥',
      category: 'medical',
      description: 'Lava ojos irritados por azufre y cura laceraciones de expedicionarios.'
    }),
    new ShelterBuilding({
      id: 'workshop',
      name: 'Taller de Máscaras y Filtros',
      icon: '🛠️',
      category: 'crafting',
      description: 'Reparación de trajes herméticos, herramientas y fabricación de filtros.'
    })
  ];
}

/**
 * resources.js - Gestión de Suministros y Recursos Críticos del Refugio
 * Comida, Agua, Suministros Médicos, Filtros de Aire, Combustible y Materiales.
 */

export class ShelterResources {
  constructor(initialData = {}) {
    this.foodRations = initialData.foodRations ?? 40.0;
    this.waterLiters = initialData.waterLiters ?? 55.0;
    this.medicalSupplies = initialData.medicalSupplies ?? 12;
    this.airFilters = initialData.airFilters ?? 6;
    this.fuelUnits = initialData.fuelUnits ?? 25.0;
    this.materials = initialData.materials ?? 30;
    this.filterWearPercent = initialData.filterWearPercent ?? 12.0; // 0% a 100%
  }

  consumeDaily(livingCount) {
    const foodConsumed = livingCount * 0.9;
    const waterConsumed = livingCount * 1.2;

    this.foodRations = Math.max(0, this.foodRations - foodConsumed);
    this.waterLiters = Math.max(0, this.waterLiters - waterConsumed);

    return { foodConsumed, waterConsumed };
  }

  replaceAirFilter() {
    if (this.airFilters <= 0) return { success: false, reason: 'Sin filtros de repuesto disponibles' };
    this.airFilters -= 1;
    this.filterWearPercent = 0.0;
    return { success: true, message: 'Filtro nuevo de carbón activado instalado con éxito.' };
  }

  craftFilter() {
    const requiredMaterials = 10;
    const requiredFuel = 4;
    if (this.materials < requiredMaterials || this.fuelUnits < requiredFuel) {
      return { success: false, reason: 'Se requieren 10 de materiales y 4 de combustible.' };
    }
    this.materials -= requiredMaterials;
    this.fuelUnits -= requiredFuel;
    this.airFilters += 1;
    return { success: true, message: 'Se ha manufacturado un filtro respiratorio hermético.' };
  }

  hasCriticalDepletion() {
    const alerts = [];
    if (this.foodRations <= 5) alerts.push('Reserva de alimentos al borde del colapso');
    if (this.waterLiters <= 8) alerts.push('Reserva de agua en nivel de sequía extrema');
    if (this.airFilters === 0 && this.filterWearPercent > 80) alerts.push('¡Filtro a punto de saturarse y no hay repuestos!');
    return alerts;
  }
}

/**
 * jobs.js - Sistema de Asignación de Tareas y Roles en el Refugio
 */

export const JOB_DEFINITIONS = {
  descanso: {
    id: 'descanso',
    name: 'Descanso y Cuidados',
    icon: '🛌',
    description: 'Recupera fatiga y reduce el estrés respiratorio manteniéndose en reposo.'
  },
  purifier: {
    id: 'purifier',
    name: 'Mantenimiento del Purificador',
    icon: '💨',
    description: 'Limpia toberas de ventilación y previene el bloqueo de los filtros de aire.'
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Cultivo en Invernadero',
    icon: '🌱',
    description: 'Atiende cultivos hidropónicos para generar raciones de alimento frescas.'
  },
  clinic: {
    id: 'clinic',
    name: 'Guardia en Enfermería',
    icon: '🏥',
    description: 'Provee cuidados intensivos a los compañeros heridos o con asfixia.'
  },
  workshop: {
    id: 'workshop',
    name: 'Taller de Ensamblaje',
    icon: '🛠️',
    description: 'Fabrica mascarillas, repara herramientas y elabora nuevos filtros.'
  }
};

export class JobManager {
  static assign(survivor, jobId, buildings) {
    if (!survivor.isAlive) return false;
    
    // Si ya tenía edificio previo, desasignar
    for (const b of buildings) {
      b.assignedWorkers = b.assignedWorkers.filter(id => id !== survivor.id);
    }

    survivor.assignedJob = jobId;

    // Asignar al nuevo edificio si corresponde
    if (jobId !== 'descanso') {
      const b = buildings.find(item => item.id === jobId);
      if (b && b.assignedWorkers.length < b.workersMax) {
        b.assignedWorkers.push(survivor.id);
      }
    }
    return true;
  }
}

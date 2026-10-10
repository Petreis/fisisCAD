import * as THREE from 'three';

/**
 * Utilitários Geométricos CAD & Validador Topológico - FisisCAD PRO
 * 
 * Responsável por:
 * 1. Validação de perfil fechado para extrusão sólida
 * 2. Snapping magnético inteligente (Vértices, Pontos Médios, Interseções, Centro, Grade)
 * 3. Geração de malha 3D sólida paramétrica a partir do perfil fechado (THREE.Shape & ExtrudeGeometry)
 */

/**
 * Distância Euclidiana entre dois pontos 2D
 */
export const dist2D = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

/**
 * Calcula a interseção entre dois segmentos de reta (se existir)
 */
export const lineIntersection2D = (p1, p2, p3, p4) => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return null; // Paralelas ou coincidentes

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
    return {
      x: p1.x + u * (p2.x - p1.x),
      y: p1.y + u * (p2.y - p1.y)
    };
  }
  return null;
};

/**
 * Validação rigorosa de perfil fechado para extrusão (Requisito 4)
 * @param {Array} lines - Array de linhas [{ x1, y1, x2, y2 }]
 * @param {number} tolerance - Tolerância de coincidência em pixels/mm (padrão: 6)
 * @returns {object} { isValid: boolean, message: string, orderedPoints: Array, openEnds: Array, area: number }
 */
export const validateClosedProfile = (lines, tolerance = 6) => {
  if (!lines || lines.length < 3) {
    return {
      isValid: false,
      message: 'Um perfil fechado requer pelo menos 3 linhas conectadas para formar uma região sólida.',
      orderedPoints: [],
      openEnds: lines.flatMap(l => [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }]),
      area: 0
    };
  }

  // Clona as linhas para manipular
  const remaining = lines.map(l => ({ ...l }));
  const orderedPoints = [{ x: remaining[0].x1, y: remaining[0].y1 }];
  let currentEnd = { x: remaining[0].x2, y: remaining[0].y2 };
  orderedPoints.push(currentEnd);
  remaining.splice(0, 1);

  let isClosed = false;

  while (remaining.length > 0) {
    let foundIndex = -1;
    let flip = false;

    for (let i = 0; i < remaining.length; i++) {
      const ln = remaining[i];
      // Verifica conexão com x1, y1
      if (dist2D(currentEnd, { x: ln.x1, y: ln.y1 }) <= tolerance) {
        foundIndex = i;
        flip = false;
        break;
      }
      // Verifica conexão com x2, y2
      if (dist2D(currentEnd, { x: ln.x2, y: ln.y2 }) <= tolerance) {
        foundIndex = i;
        flip = true;
        break;
      }
    }

    if (foundIndex === -1) {
      // Perfil aberto ou linha desconectada!
      break;
    }

    const nextLine = remaining[foundIndex];
    remaining.splice(foundIndex, 1);

    if (!flip) {
      currentEnd = { x: nextLine.x2, y: nextLine.y2 };
    } else {
      currentEnd = { x: nextLine.x1, y: nextLine.y1 };
    }
    orderedPoints.push(currentEnd);
  }

  // Verifica se o último ponto fecha com o primeiro
  const startPoint = orderedPoints[0];
  const lastPoint = orderedPoints[orderedPoints.length - 1];
  const closureDist = dist2D(lastPoint, startPoint);

  if (remaining.length === 0 && closureDist <= tolerance) {
    isClosed = true;
    // Harmoniza o último ponto para coincidir exatamente com o primeiro
    orderedPoints[orderedPoints.length - 1] = { ...startPoint };
  }

  // Calcula área com a fórmula do polígono (Shoelace)
  let area = 0;
  for (let i = 0; i < orderedPoints.length - 1; i++) {
    area += (orderedPoints[i].x * orderedPoints[i + 1].y) - (orderedPoints[i + 1].x * orderedPoints[i].y);
  }
  area = Math.abs(area) / 2;

  if (isClosed && area > 20) {
    return {
      isValid: true,
      message: `Perfil fechado válido com ${orderedPoints.length - 1} arestas conectadas. Pronto para extrusão sólida.`,
      orderedPoints,
      openEnds: [],
      area: Math.round(area)
    };
  } else {
    // Coleta extremidades soltas para visualização em vermelho
    const openEnds = [];
    if (!isClosed) {
      openEnds.push(lastPoint, startPoint);
    }
    if (remaining.length > 0) {
      remaining.forEach(r => openEnds.push({ x: r.x1, y: r.y1 }, { x: r.x2, y: r.y2 }));
    }

    const distInfo = closureDist > tolerance 
      ? `Abertura detectada de ${closureDist.toFixed(1)}u entre início e fim.` 
      : 'Há segmentos isolados ou desconectados.';

    return {
      isValid: false,
      message: `Extrusão bloqueada: O perfil não está fechado. ${distInfo} Conecte todas as extremidades.`,
      orderedPoints: [],
      openEnds,
      area: 0
    };
  }
};

/**
 * Snapping inteligente multiponto (Requisito 3)
 * Prioridade:
 * 1. Vértices / extremidades existentes
 * 2. Interseções entre linhas
 * 3. Pontos médios das linhas
 * 4. Centro / Centróide do perfil
 * 5. Eixos cartesianos principais
 * 6. Grade (Grid)
 */
export const findSmartSnapPoint = (rawPos, lines = [], options = {}) => {
  const vertexTol = options.vertexTolerance || 14;
  const midTol = options.midpointTolerance || 10;
  const gridSnap = options.grid || 20;

  // 1. Snapping a Vértices / Extremidades de linhas existentes
  for (const ln of lines) {
    const p1 = { x: ln.x1, y: ln.y1 };
    if (dist2D(rawPos, p1) <= vertexTol) {
      return { x: p1.x, y: p1.y, snapType: 'vertex', label: 'Vértice (Snap)' };
    }
    const p2 = { x: ln.x2, y: ln.y2 };
    if (dist2D(rawPos, p2) <= vertexTol) {
      return { x: p2.x, y: p2.y, snapType: 'vertex', label: 'Vértice (Snap)' };
    }
  }

  // 2. Snapping a Interseções entre linhas existentes
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const pA1 = { x: lines[i].x1, y: lines[i].y1 };
      const pA2 = { x: lines[i].x2, y: lines[i].y2 };
      const pB1 = { x: lines[j].x1, y: lines[j].y1 };
      const pB2 = { x: lines[j].x2, y: lines[j].y2 };

      const inter = lineIntersection2D(pA1, pA2, pB1, pB2);
      if (inter && dist2D(rawPos, inter) <= vertexTol) {
        return { x: Math.round(inter.x), y: Math.round(inter.y), snapType: 'intersection', label: 'Interseção (Snap)' };
      }
    }
  }

  // 3. Snapping a Pontos Médios de linhas
  for (const ln of lines) {
    const mid = { x: (ln.x1 + ln.x2) / 2, y: (ln.y1 + ln.y2) / 2 };
    if (dist2D(rawPos, mid) <= midTol) {
      return { x: Math.round(mid.x), y: Math.round(mid.y), snapType: 'midpoint', label: 'Ponto Médio (Snap)' };
    }
  }

  // 4. Snapping ao Centróide das linhas atuais se houver mais de 2 linhas
  if (lines.length >= 3) {
    let sumX = 0, sumY = 0, count = 0;
    lines.forEach(l => {
      sumX += l.x1 + l.x2;
      sumY += l.y1 + l.y2;
      count += 2;
    });
    const center = { x: sumX / count, y: sumY / count };
    if (dist2D(rawPos, center) <= midTol) {
      return { x: Math.round(center.x), y: Math.round(center.y), snapType: 'center', label: 'Centro (Snap)' };
    }
  }

  // 5. Snapping aos Eixos de Origem X=0 e Y=0 (se passar o tamanho do canvas)
  if (options.origin) {
    if (Math.abs(rawPos.x - options.origin.x) <= 8) {
      return { x: options.origin.x, y: rawPos.y, snapType: 'axis', label: 'Eixo Y (Snap)' };
    }
    if (Math.abs(rawPos.y - options.origin.y) <= 8) {
      return { x: rawPos.x, y: options.origin.y, snapType: 'axis', label: 'Eixo X (Snap)' };
    }
  }

  // 6. Snapping à Grade regular
  const snappedGrid = {
    x: Math.round(rawPos.x / gridSnap) * gridSnap,
    y: Math.round(rawPos.y / gridSnap) * gridSnap,
    snapType: 'grid',
    label: 'Grade'
  };

  return snappedGrid;
};

/**
 * Cria uma geometria 3D extrudada real a partir de um perfil 2D fechado
 * @param {Array} orderedPoints - Vértices ordenados [{x, y}]
 * @param {number} depth - Altura de extrusão
 * @param {string} workingPlane - Plano de extrusão ('XY' | 'XZ' | 'YZ')
 */
export const createExtrudedGeometryFromProfile = (orderedPoints, depth = 50, workingPlane = 'XY') => {
  if (!orderedPoints || orderedPoints.length < 3) {
    return new THREE.BoxGeometry(4, 2, 2);
  }

  // Centraliza o polígono em torno da sua origem
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  orderedPoints.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const scale = 0.05; // Conversão de pixels para unidades 3D Three.js

  const shape = new THREE.Shape();
  const p0 = orderedPoints[0];
  shape.moveTo((p0.x - centerX) * scale, (p0.y - centerY) * scale);

  for (let i = 1; i < orderedPoints.length; i++) {
    const pt = orderedPoints[i];
    shape.lineTo((pt.x - centerX) * scale, (pt.y - centerY) * scale);
  }

  const extrudeSettings = {
    depth: depth * scale,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1
  };

  try {
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.computeVertexNormals();

    // Rotaciona conforme o plano de trabalho
    if (workingPlane === 'XZ') {
      geom.rotateX(Math.PI / 2);
    } else if (workingPlane === 'YZ') {
      geom.rotateY(Math.PI / 2);
    }

    return geom;
  } catch (err) {
    console.warn('Falha na triangulação de perfil 3D complexo, aplicando geometria segura:', err);
    return new THREE.BoxGeometry(4, 2, 2);
  }
};

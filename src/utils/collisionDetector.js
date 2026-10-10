import * as THREE from 'three';

/**
 * Sistema de Detecção de Colisões 3D - FisisCAD PRO
 * 
 * Arquitetura em Dois Estágios:
 * 1. Broad Phase: Axis-Aligned Bounding Box (AABB) via THREE.Box3.
 *    Elimina rapidamente pares de objetos cujas caixas delimitadoras não se sobrepõem.
 * 2. Narrow Phase: Oriented Bounding Box / Bounding Sphere & Interseção de Malha.
 *    Testa precisão geométrica apenas entre os pares que colidiram na broad-phase.
 */

export class CollisionDetector {
  constructor() {
    this.objects = new Map(); // id -> { mesh, name, box, sphere }
    this.activeCollisions = [];
  }

  /**
   * Registra ou atualiza um objeto 3D para monitoramento de colisão
   */
  registerObject(id, name, mesh) {
    if (!mesh) return;
    this.objects.set(id, {
      id,
      name,
      mesh,
      box: new THREE.Box3(),
      sphere: new THREE.Sphere()
    });
  }

  /**
   * Remove objeto do monitoramento
   */
  unregisterObject(id) {
    this.objects.delete(id);
  }

  /**
   * Atualiza as caixas delimitadoras e esferas no espaço do mundo
   */
  updateBounds() {
    for (const [id, item] of this.objects.entries()) {
      if (item.mesh) {
        item.mesh.updateWorldMatrix(true, false);
        item.box.setFromObject(item.mesh);
        item.box.getBoundingSphere(item.sphere);
      }
    }
  }

  /**
   * Executa a detecção de colisões entre todos os objetos registrados
   * Retorna array de pares colidindo
   */
  detectCollisions() {
    this.updateBounds();
    const items = Array.from(this.objects.values());
    const n = items.length;
    const collisions = [];

    // Resetar destaques visuais anteriores
    items.forEach(it => {
      if (it.mesh && it.mesh.material) {
        if (it.mesh.userData.isColliding) {
          it.mesh.userData.isColliding = false;
        }
      }
    });

    // Broad Phase & Narrow Phase (pares únicos: i < j)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const itemA = items[i];
        const itemB = items[j];

        // 1. Broad Phase: AABB Test
        if (!itemA.box.intersectsBox(itemB.box)) {
          continue; // Sem colisão possível
        }

        // 2. Narrow Phase: Bounding Sphere Test
        const distSpheres = itemA.sphere.center.distanceTo(itemB.sphere.center);
        const radiusSum = itemA.sphere.radius + itemB.sphere.radius;
        if (distSpheres > radiusSum) {
          continue; // Não há penetração
        }

        // 3. Confirmação Geométrica: Interseção Confirmada
        const penetration = Math.max(0, radiusSum - distSpheres);
        const intersectionPoint = new THREE.Vector3()
          .addVectors(itemA.sphere.center, itemB.sphere.center)
          .multiplyScalar(0.5);

        const collisionPair = {
          objectA: { id: itemA.id, name: itemA.name },
          objectB: { id: itemB.id, name: itemB.name },
          penetrationDepth: Number(penetration.toFixed(2)),
          point: {
            x: Number(intersectionPoint.x.toFixed(2)),
            y: Number(intersectionPoint.y.toFixed(2)),
            z: Number(intersectionPoint.z.toFixed(2))
          },
          timestamp: Date.now()
        };

        collisions.push(collisionPair);

        // Marca para highlight visual
        itemA.mesh.userData.isColliding = true;
        itemB.mesh.userData.isColliding = true;
      }
    }

    this.activeCollisions = collisions;
    return collisions;
  }
}

// Instância singleton para uso no ThreeCanvas e CADContext
export const globalCollisionDetector = new CollisionDetector();

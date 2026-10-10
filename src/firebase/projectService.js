import { db, auth } from './config';
import { 
  collection, doc, getDoc, getDocs, setDoc, 
  deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

/**
 * Serviço de Persistência na Nuvem - FisisCAD
 * Estrutura no Firestore:
 * Projetos / {USER_ID} / itens / {PROJECT_ID}
 */

// Helper para obter ID do usuário autenticado atual
export const getAuthenticatedUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado. Faça login para acessar projetos na nuvem.');
  return user.uid;
};

/**
 * Salvar projeto ativo na nuvem Firebase
 * @param {string} userId - UID do usuário autenticado
 * @param {object} projectData - Dados completos do projeto CAD
 * @param {string} [customId] - ID específico opcional
 */
export const salvarProjetoNuvem = async (userId, projectData, customId = null) => {
  if (!userId) userId = getAuthenticatedUserId();
  if (!projectData || !projectData.name) {
    throw new Error('Dados do projeto inválidos ou sem nome definido.');
  }

  // Gera ou utiliza ID único do projeto
  const projectId = customId || projectData.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const docRef = doc(db, 'Projetos', userId, 'itens', projectId);

  const payload = {
    ...projectData,
    id: projectId,
    criadorId: userId,
    criadorEmail: auth.currentUser?.email || '',
    criadorNome: auth.currentUser?.displayName || 'Usuário FisisCAD',
    updatedAt: new Date().toISOString(),
    updatedAtTimestamp: serverTimestamp(),
  };

  // Se for criação inicial
  if (!projectData.createdAt) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(docRef, payload, { merge: true });
  return { id: projectId, name: projectData.name };
};

/**
 * Salvar como Novo Projeto na nuvem (duplicação / versão alternativa)
 */
export const salvarComoNovoProjetoNuvem = async (userId, projectData, novoNome) => {
  if (!userId) userId = getAuthenticatedUserId();
  const novoId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nomeFinal = novoNome.endsWith('.cad') ? novoNome : `${novoNome}.cad`;

  const novoProjeto = {
    ...projectData,
    id: novoId,
    name: nomeFinal,
    createdAt: new Date().toISOString(),
  };

  return await salvarProjetoNuvem(userId, novoProjeto, novoId);
};

/**
 * Listar todos os projetos do usuário autenticado
 */
export const listarProjetosNuvem = async (userId) => {
  if (!userId) userId = getAuthenticatedUserId();
  const colRef = collection(db, 'Projetos', userId, 'itens');

  try {
    const q = query(colRef);
    const snapshot = await getDocs(q);
    const projetos = [];

    snapshot.forEach(docSnap => {
      projetos.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Ordenar do mais recente para o mais antigo por updatedAt ou createdAt
    projetos.sort((a, b) => {
      const dataA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dataB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dataB - dataA;
    });

    return projetos;
  } catch (err) {
    console.error('Erro ao listar projetos na nuvem:', err);
    throw new Error('Falha ao obter lista de projetos na nuvem. Verifique a conexão e permissões.');
  }
};

/**
 * Carregar um projeto específico da nuvem
 */
export const carregarProjetoNuvem = async (userId, projectId) => {
  if (!userId) userId = getAuthenticatedUserId();
  if (!projectId) throw new Error('ID do projeto não especificado.');

  const docRef = doc(db, 'Projetos', userId, 'itens', projectId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error(`Projeto com ID '${projectId}' não foi localizado na nuvem.`);
  }

  return snap.data();
};

/**
 * Excluir projeto da nuvem
 */
export const excluirProjetoNuvem = async (userId, projectId) => {
  if (!userId) userId = getAuthenticatedUserId();
  if (!projectId) throw new Error('ID do projeto não especificado.');

  const docRef = doc(db, 'Projetos', userId, 'itens', projectId);
  await deleteDoc(docRef);
  return true;
};

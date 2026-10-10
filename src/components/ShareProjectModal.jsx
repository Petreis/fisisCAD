import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import { Share2, Users, UserPlus, ShieldCheck, Lock, Check, X, Eye, Edit3 } from 'lucide-react';

export const ShareProjectModal = ({ isOpen, onClose }) => {
  const { project, setProject, addLog } = useCAD();
  const [targetEmail, setTargetEmail] = useState('');
  const [role, setRole] = useState('editor'); // editor | viewer
  const [members, setMembers] = useState(project.membros || {
    'uid_owner': { email: project.author || 'proprietario@fisiscad.edu', role: 'owner' },
    'uid_aluno1': { email: 'aluno.engenharia@usp.br', role: 'editor' },
    'uid_prof1': { email: 'professor.fisica@unicamp.br', role: 'viewer' }
  });

  if (!isOpen) return null;

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!targetEmail) return;

    const newMemberUid = `uid_${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const updatedMembers = {
      ...members,
      [newMemberUid]: { email: targetEmail, role }
    };

    setMembers(updatedMembers);
    setProject(prev => ({
      ...prev,
      membros: updatedMembers,
      projetos_compartilhados: [...(prev.projetos_compartilhados || []), newMemberUid]
    }));

    addLog(`Projeto '${project.name}' compartilhado com ${targetEmail} com permissão de [${role.toUpperCase()}].`);
    setTargetEmail('');
  };

  const removeMember = (uidKey) => {
    const next = { ...members };
    delete next[uidKey];
    setMembers(next);
    addLog(`Acesso de compartilhamento removido para o membro.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-surface-container border border-outline/40 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-high border-b border-outline/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shadow">
              <Share2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface font-sans flex items-center gap-2">
                Compartilhar Projeto (.cad)
              </h2>
              <p className="text-xs text-outline font-mono">Gerencie permissões de acesso privado, edição e leitura.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-bright">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Form */}
          <form onSubmit={handleShareSubmit} className="space-y-3 bg-surface-container-lowest p-4 rounded-xl border border-outline/20">
            <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Adicionar Novo Membro</span>
            
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Digite o e-mail do usuário (ex: aluno@universidade.edu)..."
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline/30 px-3 py-2 rounded text-on-surface text-xs focus:border-secondary outline-none font-sans"
                required
              />

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-surface-container rounded p-0.5 border border-outline/30">
                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
                      role === 'editor' ? 'bg-primary-container text-on-primary-container shadow' : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editor (Modificar)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('viewer')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
                      role === 'viewer' ? 'bg-surface-bright text-secondary shadow' : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Leitor (Visualizar)
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary hover:bg-primary text-on-primary font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                >
                  <UserPlus className="w-4 h-4" /> Conceder Acesso
                </button>
              </div>
            </div>
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Usuários com Acesso ao Projeto ({Object.keys(members).length})</span>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {Object.entries(members).map(([uidKey, info]) => (
                <div key={uidKey} className="p-3 bg-surface-container-lowest rounded-lg border border-outline/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                      {info.email ? info.email[0].toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <p className="text-on-surface font-semibold truncate text-xs">{info.email}</p>
                      <span className="text-[10px] text-outline">
                        {info.role === 'owner' && '👑 Proprietário Criador'}
                        {info.role === 'editor' && '✏️ Editor (Modifica simultaneamente)'}
                        {info.role === 'viewer' && '👁️ Leitor (Visualização Apenas)'}
                      </span>
                    </div>
                  </div>

                  {info.role !== 'owner' && (
                    <button 
                      onClick={() => removeMember(uidKey)}
                      className="text-outline hover:text-error p-1 rounded hover:bg-surface-bright"
                      title="Revogar Acesso"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

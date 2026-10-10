import React, { useState, useEffect } from 'react';
import { useCAD } from '../context/CADContext';
import { 
  Cloud, FolderOpen, Save, Plus, Trash2, X, RefreshCw, 
  Calendar, FileCode, Check, AlertCircle, ArrowRight 
} from 'lucide-react';

export const CloudProjectsModal = ({ isOpen, onClose }) => {
  const { 
    currentUser, project, setProject, 
    saveProjectCloud, saveProjectAsNewCloud, 
    loadProjectFromCloud, listProjectsFromCloud, deleteProjectFromCloud,
    addLog, setActiveView 
  } = useCAD();

  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState(project.name || 'Meu_Projeto.cad');
  const [saveAsName, setSaveAsName] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'saveAs'

  useEffect(() => {
    if (isOpen && currentUser) {
      loadList();
    }
  }, [isOpen, currentUser]);

  const loadList = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const list = await listProjectsFromCloud();
      setProjectsList(list);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const ok = await saveProjectCloud(saveName);
      if (ok) {
        setStatusMsg({ type: 'success', text: `Projeto '${saveName}' salvo com sucesso na nuvem!` });
        await loadList();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAs = async (e) => {
    e.preventDefault();
    if (!saveAsName.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const ok = await saveProjectAsNewCloud(saveAsName.trim());
      if (ok) {
        setStatusMsg({ type: 'success', text: `Novo projeto '${saveAsName}' criado na nuvem!` });
        setSaveAsName('');
        setActiveTab('list');
        await loadList();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async (projId) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const ok = await loadProjectFromCloud(projId);
      if (ok) {
        onClose();
        setActiveView('cad_inventor');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e, projId, projName) => {
    e.stopPropagation();
    if (!confirm(`Deseja realmente excluir o projeto '${projName}' da nuvem?`)) return;

    setLoading(true);
    try {
      await deleteProjectFromCloud(projId);
      setStatusMsg({ type: 'success', text: `Projeto '${projName}' removido.` });
      await loadList();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Projetos na Nuvem Firebase
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Projetos/{currentUser?.uid ? `${currentUser.uid.substring(0, 8)}...` : 'User'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Armazenamento isolado e seguro no Firestore associado à sua conta Google.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs & Quick Save */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> Meus Projetos ({projectsList.length})
            </button>
            <button
              onClick={() => setActiveTab('saveAs')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'saveAs' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Salvar Como Novo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSave}
              disabled={loading}
              className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Salvar alterações no projeto atual"
            >
              <Save className="w-3.5 h-3.5" /> Salvar Projeto Atual
            </button>
            <button
              onClick={loadList}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {statusMsg && (
          <div className={`mx-6 mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'
          }`}>
            {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 min-h-[260px]">
          {activeTab === 'saveAs' ? (
            <form onSubmit={handleSaveAs} className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Salvar como Novo Projeto na Nuvem
              </h3>
              <p className="text-slate-400 text-xs font-sans">
                Cria uma nova entrada independente no Firestore preservando a geometria, materiais, histórico de operações e configurações FEA.
              </p>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Nome do Projeto:</label>
                <input
                  type="text"
                  value={saveAsName}
                  onChange={e => setSaveAsName(e.target.value)}
                  placeholder="Ex: Suporte_Turbina_Versao_Final.cad"
                  className="w-full bg-[#0d1117] border border-white/15 px-3 py-2 rounded-lg text-white font-mono focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !saveAsName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" /> Confirmar e Salvar
                </button>
              </div>
            </form>
          ) : (
            <div>
              {loading && projectsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                  <div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
                  <span>Sincronizando com Firestore...</span>
                </div>
              ) : projectsList.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-white/5 rounded-xl border border-white/10 p-6">
                  <Cloud className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-300 font-bold font-sans">Nenhum projeto salvo na nuvem ainda.</p>
                  <p className="text-slate-500 text-xs">
                    Clique em "Salvar Projeto Atual" acima para guardar seu trabalho no Firebase.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectsList.map(item => {
                    const isCurrent = item.id === project.id;
                    const dateFormatted = item.updatedAt 
                      ? new Date(item.updatedAt).toLocaleString('pt-BR') 
                      : (item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'Sem data');

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenProject(item.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                          isCurrent
                            ? 'bg-blue-500/15 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                            : 'bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400 group-hover:text-blue-400'
                          }`}>
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs truncate">{item.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">
                                  ATIVO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {dateFormatted}
                              </span>
                              <span>·</span>
                              <span>{item.material?.name || 'Aço'}</span>
                              <span>·</span>
                              <span>{item.historyTree?.length || 0} operações</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenProject(item.id)}
                            className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg font-bold flex items-center gap-1 transition-all"
                            title="Abrir no Workspace"
                          >
                            Abrir <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(e, item.id, item.name)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir da nuvem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

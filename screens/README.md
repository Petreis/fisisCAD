# 📐 FisisCAD - Telas Importadas do Stitch

Este diretório contém a estrutura de arquivos HTML exportada diretamente do Stitch (**FisisCAD: Plataforma de Simulação Física**), organizada para servir de base no futuro desenvolvimento da aplicação web.

---

## 📁 Estrutura de Pastas

```
screens/
├── desktop/
│   ├── 01_hub_projetos.html            # Início / Hub de Projetos
│   ├── 02_workspace_cad_inventor.html  # Workspace de Modelagem CAD/Inventor
│   ├── 03_workspace_modelagem.html     # Workspace de Modelagem 2D/3D (Desktop)
│   ├── 04_selecao_ensaios.html         # Seleção de Ensaios Físicos
│   ├── 05_ambiente_simulacao.html      # Ambiente de Simulação Física Visual
│   ├── 06_estudio_materiais.html       # Estúdio de Materiais e Condições de Contorno
│   └── 07_analise_relatorios.html      # Análise de Dados e Relatórios Técnicos
│
├── mobile/
│   ├── 01_workspace_modelagem_mobile.html # Workspace 2D/3D (Mobile)
│   ├── 02_estudio_materiais_mobile.html   # Estúdio de Materiais (Mobile)
│   ├── 03_analise_relatorios_mobile.html  # Análise de Dados e Relatórios (Mobile)
│   └── 04_ambiente_simulacao_mobile.html  # Ambiente de Simulação (Mobile)
│
└── README.md
```

---

## 🖥️ Telas Desktop

1. **[01_hub_projetos.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/01_hub_projetos.html)**
   - **Descrição:** Dashboard principal com biblioteca de projetos, atalhos rápidos e status de solvers.

2. **[02_workspace_cad_inventor.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/02_workspace_cad_inventor.html)**
   - **Descrição:** Ambiente completo de modelagem técnica parametric (estilo Autodesk Inventor / SolidWorks).

3. **[03_workspace_modelagem.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/03_workspace_modelagem.html)**
   - **Descrição:** Canvas interativo 2D/3D com barras de ferramentas de geometrias e transformações.

4. **[04_selecao_ensaios.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/04_selecao_ensaios.html)**
   - **Descrição:** Catálogo e configuração de ensaios físicos (Tração, Compressão, Análise Térmica, Escoamento Fluidodinâmico).

5. **[05_ambiente_simulacao.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/05_ambiente_simulacao.html)**
   - **Descrição:** Viewport de elementos finitos (FEA/CFD) com visualização em tempo real de malhas e mapas de tensão (Von Mises).

6. **[06_estudio_materiais.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/06_estudio_materiais.html)**
   - **Descrição:** Editor de propriedades de materiais (Módulo de Young, Poisson, condutividade) e aplicação de cargas/fixações.

7. **[07_analise_relatorios.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/desktop/07_analise_relatorios.html)**
   - **Descrição:** Painel de pós-processamento com geração de gráficos telemetry, tabelas de convergência e exportação de relatórios PDF/STEP.

---

## 📱 Telas Mobile

1. **[01_workspace_modelagem_mobile.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/mobile/01_workspace_modelagem_mobile.html)**
   - **Descrição:** Interface adaptada para toque com viewport 3D e barras flutuantes compactas.

2. **[02_estudio_materiais_mobile.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/mobile/02_estudio_materiais_mobile.html)**
   - **Descrição:** Configuração de contornos e catálogo de materiais otimizado para dispositivos móveis.

3. **[03_analise_relatorios_mobile.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/mobile/03_analise_relatorios_mobile.html)**
   - **Descrição:** Leitura de relatórios e métricas de simulação em formato responsivo.

4. **[04_ambiente_simulacao_mobile.html](file:///c:/Users/carlo/OneDrive/Documentos/FisisCAD/screens/mobile/04_ambiente_simulacao_mobile.html)**
   - **Descrição:** Visualizador portátil de simulação e monitoramento de solvers.

---

## 🚀 Próximos Passos (Futura Implementação Web)
- Extrair componentes reutilizáveis (Header, Sidebar, Telemetry Bar, Property Panels).
- Conectar renderizadores 3D em WebGL/Three.js nos viewports dos canvas HTML.
- Integrar a lógica de rotas e estado da aplicação.

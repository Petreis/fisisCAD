# FisisCAD PRO 🚀
### Sistema Integrado de Modelagem CAD 3D Paramétrica e Análise de Engenharia CAE/FEA

![FisisCAD PRO](https://img.shields.io/badge/Status-Produ%C3%A7%C3%A3o-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange)

O **FisisCAD PRO** é uma plataforma web para engenharia mecânica, computação gráfica e cálculo estrutural. Combina a facilidade e usabilidade de ferramentas clássicas de CAD (AutoCAD / Autodesk Inventor) com motor de cálculo por elementos finitos (FEA) no navegador e sincronização em nuvem via Firebase.

---

## 🌟 Principais Recursos

1. **Hub & Tela Inicial Estilo AutoCAD:**
   - Criação de novos projetos com parâmetros de seção.
   - Lista de projetos recentes e templates estruturais pré-configurados (Viga I, Tubo Circular, Caixa Estrutural, Eixo).
   - Estatísticas em tempo real e atalhos de comando.

2. **Modelagem 2D/3D (Esboço & Extrusão Estilo Inventor):**
   - Criação de esboços 2D sobre planos cartesianos ortogonais (**XY**, **XZ**, **YZ**).
   - Ferramentas de Linha, Retângulo, Hexágono e Formas Regulares.
   - **Snapping multiponto inteligente:** Vértices, pontos médios, centros, interseções, eixos e grade.
   - **Validação topológica estrita:** Bloqueio preventivo de extrusão para perfis abertos ou auto-intersectantes, com destaque visual de extremidades desconectadas.
   - Extrusão paramétrica viva com geração de malha sólida 3D em tempo real.

3. **CAD Inventor Sólido Paramétrico:**
   - Árvore de operações histórica ativa (.cad).
   - Adição e edição dinâmica de operações (Furos passantes, Filetes, Chanfros, Cortes).
   - Seleção de faces e arestas 3D via *Raycasting* com telemetria de normais e coordenadas de contato.
   - Inversão de visibilidade e supressão de operações com recálculo instantâneo de malha.

4. **Motor de Cálculo Estrutural FEA (Euler-Bernoulli + Critério de Von Mises):**
   - Transparência metodológica educacional: cálculo analítico-numérico no navegador sem falsificação de dados.
   - Mapeamento de tensões equivalentes de Von Mises com gradiente de cor em tempo real na malha 3D.
   - Cálculo de tensões normais, cisalhamento, deflexão nodal, reações de apoio ($R_y, M_R$) e Fator de Segurança (FoS).
   - Suporte a apoios engastados (*cantilever*) e bi-apoiados com cargas pontuais e distribuídas.

5. **Estúdio de Materiais Técnicos:**
   - Biblioteca com 12 materiais reais da literatura de engenharia (Aços ao Carbono, Aços Liga, Inox 304/316, Ligas de Alumínio 6061-T6/7075-T6, Titânio Ti-6Al-4V, Latão, Nylon, PEEK, Ferro Fundido Nodular).
   - Campos com indicação de *"Não informado"* para propriedades sem ensaio mensurado.
   - Criador de materiais customizados com cálculo automático de Módulo de Cisalhamento ($G$).

6. **Detecção de Interferências e Colisões 3D:**
   - Algoritmo de duas fases: *Broad-phase* via caixas envolventes (AABB / `Box3`) + *Narrow-phase* via esferas limitantes.
   - Feedback visual imediato e cálculo de profundidade de penetração.

7. **Nuvem Firebase & Persistência:**
   - Autenticação Google OAuth (Google Identity Provider).
   - Persistência e listagem de projetos em nuvem no Firestore (`Projetos/{USER_ID}/itens/{PROJECT_ID}`) com regras de segurança ativas.
   - Exportação e importação de arquivos locais no formato `.cad` (JSON estruturado).
   - Geração de relatórios formais em PDF com tabelas e gráficos, além de scripts Python/Jupyter exportáveis.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite
- **Renderização 3D:** Three.js, Lucide React
- **Estilização:** Tailwind CSS, Material Design Tokens
- **Cálculo Numérico & Gráficos:** Recharts, jsPDF, Canvas 2D Context
- **Backend / BaaS:** Google Firebase (Authentication & Cloud Firestore)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm` ou `yarn`

### Instalação
```bash
# Clone o repositório
git clone https://github.com/Petreis/fisisCAD.git

# Acesse o diretório
cd fisisCAD

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Build de Produção
```bash
npm run build
```

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo de licença para mais informações.

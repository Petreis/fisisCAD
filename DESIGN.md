---
name: FisisCAD Precision Engineering System
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bfc7d2'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#89929b'
  outline-variant: '#3f4850'
  surface-tint: '#93ccff'
  primary: '#93ccff'
  on-primary: '#003351'
  primary-container: '#3198dc'
  on-primary-container: '#002c47'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#8990a8'
  on-tertiary-container: '#22293d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  background: '#0f131c'
  on-background: '#dfe2ef'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  title-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.625rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  telemetry-num:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.5rem
  margin: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

O **FisisCAD** adota um estilo visual de **Brutalismo Técnico e Minimalismo de Engenharia**. A estética recria consoles de instrumentação industrial e softwares de ponta (como Plasticity, Onshape e Blender), priorizando a clareza espacial do canvas 3D e reduzindo o cansaço visual em sessões longas de trabalho.

## Colors

- **Superfícies Dark Base (`#0f131c` / `#161b26`)**: Fundo profundo para viewport 3D e contêineres docking.
- **Primário Blue (`#93ccff`)**: Destaques funcionais, seleções ativas de geometrias e foco.
- **Secundário Cyan (`#3198dc`)**: Barras de progresso de solver, interações e botões de ação secundários.
- **Eixos Tri-Axiais (XYZ)**:
  - Eixo X (Comprimento): `#ef4444` (Vermelho)
  - Eixo Y (Altura): `#22c55e` (Verde)
  - Eixo Z (Profundidade): `#3b82f6` (Azul)

## Typography

- **Geist**: Rótulos de interface, navegação e comandos de menu.
- **JetBrains Mono**: Telemetria em tempo real, coordenadas ($X, Y, Z$), matrizes de deformação e valores de força.

## Layout & Spacing

- **Desktop CAD Shell**: Header superior fixo de 56px, barra lateral esquerda (Feature Tree / Navegação de Telas), canvas central 3D responsivo de 100%, inspector lateral direito e barra de telemetria inferior de 28px.
- **Mobile CAD Shell**: Header compacto com indicador de solver, canvas central 3D e botões de ação rápida flutuantes (FABs) com gavetas retráteis.

## Elevation & Depth

- **Nível 0**: Canvas de espaço tridimensional (`#0f131c`).
- **Nível 1**: Painéis acoplados dockable (`#1c1f29`) com bordas técnicas de 1px (`#283042`).
- **Nível 2**: Diálogos flutuantes e assistente de IA com desfoque de fundo (`backdrop-filter: blur(12px)`).

## Components

- **ViewCube 3D**: Navegação interativa no canto superior direito do canvas.
- **Player Temporal (HUD)**: Controles de reprodução física (Play, Pause, Step, Timeline scrub).
- **Assistente IA Multimodal**: Painel de upload e interpretação de croquis e relatórios PDF/imagens para conversão automática em modelo `.cad`.
- **Gerenciador de Arquivos `.cad`**: Salvamento, carregamento e exportação binária/JSON dos projetos.

/**
 * Biblioteca de Materiais de Engenharia - FisisCAD PRO
 * Dados baseados em literatura técnica de referência:
 * - Callister, W. D. "Ciência e Engenharia de Materiais: Uma Introdução"
 * - Hibbeler, R. C. "Resistência dos Materiais"
 * - ASM Handbook / MatWeb
 * 
 * Regra: Quando uma propriedade não for aplicável ou não mensurada diretamente,
 * expressar explicitamente como "Não informado" ou "Valor não definido"
 * e JAMAIS inventar dados.
 */

export const DEFAULT_MATERIALS = [
  {
    id: 'mat_steel_a36',
    name: 'Aço Estrutural ASTM A36',
    category: 'Aços ao Carbono',
    density: 7850, // kg/m³
    youngModulus: 200.0, // GPa
    poissonRatio: 0.26,
    yieldStrength: 250.0, // MPa (Limite de Escoamento)
    tensileStrength: 400.0, // MPa (Resistência à Tração)
    compressiveStrength: 250.0, // MPa (Aproximadamente igual ao escoamento em tração para aços dúcteis)
    shearModulus: 79.3, // GPa (G = E / [2*(1+ν)])
    thermalExpansion: 12.0, // µm/(m·K) (10^-6 / K)
    thermalConductivity: 51.9, // W/(m·K)
    standardRef: 'ASTM A36 / NBR 7007 MR250',
    isCustom: false
  },
  {
    id: 'mat_steel_1020',
    name: 'Aço AISI 1020 Laminado',
    category: 'Aços ao Carbono',
    density: 7870,
    youngModulus: 205.0,
    poissonRatio: 0.29,
    yieldStrength: 295.0,
    tensileStrength: 395.0,
    compressiveStrength: 295.0,
    shearModulus: 80.0,
    thermalExpansion: 11.7,
    thermalConductivity: 51.9,
    standardRef: 'SAE/AISI 1020',
    isCustom: false
  },
  {
    id: 'mat_steel_4140_qt',
    name: 'Aço Liga AISI 4140 (Beneficiado/QT)',
    category: 'Aços Liga',
    density: 7850,
    youngModulus: 210.0,
    poissonRatio: 0.30,
    yieldStrength: 655.0,
    tensileStrength: 850.0,
    compressiveStrength: 655.0,
    shearModulus: 80.0,
    thermalExpansion: 12.3,
    thermalConductivity: 42.6,
    standardRef: 'SAE/AISI 4140 Q&T',
    isCustom: false
  },
  {
    id: 'mat_steel_inox_304',
    name: 'Aço Inoxidável Austenítico AISI 304',
    category: 'Aços Inoxidáveis',
    density: 8000,
    youngModulus: 193.0,
    poissonRatio: 0.29,
    yieldStrength: 215.0,
    tensileStrength: 505.0,
    compressiveStrength: 215.0,
    shearModulus: 77.0,
    thermalExpansion: 17.3,
    thermalConductivity: 16.2,
    standardRef: 'ASTM A240 / AISI 304',
    isCustom: false
  },
  {
    id: 'mat_alu_6061_t6',
    name: 'Alumínio 6061-T6',
    category: 'Ligas de Alumínio',
    density: 2700,
    youngModulus: 68.9,
    poissonRatio: 0.33,
    yieldStrength: 276.0,
    tensileStrength: 310.0,
    compressiveStrength: 276.0,
    shearModulus: 26.0,
    thermalExpansion: 23.6,
    thermalConductivity: 167.0,
    standardRef: 'ASTM B221 / AA 6061-T6',
    isCustom: false
  },
  {
    id: 'mat_alu_7075_t6',
    name: 'Alumínio 7075-T6 (Aeroespacial)',
    category: 'Ligas de Alumínio',
    density: 2810,
    youngModulus: 71.7,
    poissonRatio: 0.33,
    yieldStrength: 503.0,
    tensileStrength: 572.0,
    compressiveStrength: 503.0,
    shearModulus: 26.9,
    thermalExpansion: 23.4,
    thermalConductivity: 130.0,
    standardRef: 'ASTM B209 / AA 7075-T6',
    isCustom: false
  },
  {
    id: 'mat_ti_6al4v',
    name: 'Titânio Ti-6Al-4V (Grau 5)',
    category: 'Ligas de Titânio',
    density: 4430,
    youngModulus: 113.8,
    poissonRatio: 0.34,
    yieldStrength: 880.0,
    tensileStrength: 950.0,
    compressiveStrength: 970.0,
    shearModulus: 44.0,
    thermalExpansion: 8.6,
    thermalConductivity: 6.7,
    standardRef: 'ASTM B348 / Grade 5',
    isCustom: false
  },
  {
    id: 'mat_copper_c11000',
    name: 'Cobre Eletrolítico ETP C11000',
    category: 'Ligas de Cobre',
    density: 8940,
    youngModulus: 117.0,
    poissonRatio: 0.34,
    yieldStrength: 69.0, // Recozido
    tensileStrength: 220.0,
    compressiveStrength: 'Não informado',
    shearModulus: 44.0,
    thermalExpansion: 16.9,
    thermalConductivity: 390.0,
    standardRef: 'ASTM B152 / C11000',
    isCustom: false
  },
  {
    id: 'mat_brass_c36000',
    name: 'Latão de Corte Livre C36000',
    category: 'Ligas de Cobre/Zinco',
    density: 8500,
    youngModulus: 97.0,
    poissonRatio: 0.31,
    yieldStrength: 310.0,
    tensileStrength: 400.0,
    compressiveStrength: 'Não informado',
    shearModulus: 37.0,
    thermalExpansion: 20.5,
    thermalConductivity: 115.0,
    standardRef: 'ASTM B16 / C36000',
    isCustom: false
  },
  {
    id: 'mat_cast_iron_fc250',
    name: 'Ferro Fundido Cinzento FC 250 (ASTM Class 35)',
    category: 'Ferros Fundidos',
    density: 7200,
    youngModulus: 110.0,
    poissonRatio: 0.26,
    yieldStrength: 'Não informado (Frágil)',
    tensileStrength: 250.0,
    compressiveStrength: 825.0, // Alta resistência à compressão típica de ferro fundido
    shearModulus: 44.0,
    thermalExpansion: 11.0,
    thermalConductivity: 48.0,
    standardRef: 'ASTM A48 Class 35 / NBR 6589',
    isCustom: false
  },
  {
    id: 'mat_poly_pla',
    name: 'Polímero PLA (Manufatura Aditiva)',
    category: 'Polímeros Termoplásticos',
    density: 1240,
    youngModulus: 3.5,
    poissonRatio: 0.36,
    yieldStrength: 60.0,
    tensileStrength: 65.0,
    compressiveStrength: 70.0,
    shearModulus: 1.28,
    thermalExpansion: 68.0,
    thermalConductivity: 0.13,
    standardRef: 'ISO 527 / FFF Specimen',
    isCustom: false
  },
  {
    id: 'mat_poly_abs',
    name: 'Polímero ABS Estrutural',
    category: 'Polímeros Termoplásticos',
    density: 1040,
    youngModulus: 2.3,
    poissonRatio: 0.38,
    yieldStrength: 40.0,
    tensileStrength: 45.0,
    compressiveStrength: 65.0,
    shearModulus: 0.83,
    thermalExpansion: 88.0,
    thermalConductivity: 0.17,
    standardRef: 'ASTM D638',
    isCustom: false
  }
];

export const getMaterialById = (id) => {
  return DEFAULT_MATERIALS.find(m => m.id === id) || DEFAULT_MATERIALS[0];
};

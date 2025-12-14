
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { Search, Terminal, Activity, Eye, Grid, Maximize, Calculator, Sun, Info } from 'lucide-react';

// --- TOOLTIP HELPER ---
const ControlTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative w-full">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 text-center shadow-lg border border-white/10">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
    </div>
  </div>
);

// --- NDVI CALCULATOR DIAGRAM ---
export const NDVICalculator: React.FC = () => {
  const [nir, setNir] = useState(0.8);
  const [red, setRed] = useState(0.1);
  
  const ndvi = (nir - red) / (nir + red);
  
  const getNDVIColor = (val: number) => {
      if (val < 0) return '#3B82F6'; 
      if (val < 0.2) return '#A16207'; 
      if (val < 0.5) return '#86EFAC'; 
      return '#15803D'; 
  };

  const getNDVILabel = (val: number) => {
      if (val < 0) return 'Agua';
      if (val < 0.2) return 'Suelo';
      if (val < 0.5) return 'Arbusto';
      return 'Bosque';
  };

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
      <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold">Simulador NDVI</h3>
      <code className="text-xs bg-gray-100 p-2 rounded mb-4 block text-center text-earth-blue font-mono select-all">(NIR - RED) / (NIR + RED)</code>
      
      <div className="space-y-6 mb-6">
          <ControlTooltip text="Reflectancia en el espectro Rojo (absorbido por clorofila). Valores bajos indican vegetación sana.">
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span className="flex items-center gap-1">RED (Visible) <Info size={10}/></span>
                    <span>{red.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={red} 
                  onChange={(e) => setRed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-600 transition-colors"
                />
            </div>
          </ControlTooltip>

          <ControlTooltip text="Reflectancia en el Infrarrojo Cercano (reflejado por estructura celular). Valores altos indican vegetación sana.">
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span className="flex items-center gap-1">NIR (Infrarrojo) <Info size={10}/></span>
                    <span>{nir.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={nir} 
                  onChange={(e) => setNir(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800 hover:accent-gray-900 transition-colors"
                />
            </div>
          </ControlTooltip>
      </div>

      <div className="flex items-center justify-between mt-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="text-left">
              <span className="text-xs text-gray-400 uppercase font-bold">Resultado</span>
              <div className="text-2xl font-bold text-earth-dark">{ndvi.toFixed(2)}</div>
          </div>
          <div className="text-right">
               <div 
                className="px-3 py-1 rounded text-xs font-bold text-white mb-1 inline-block transition-colors duration-300"
                style={{ backgroundColor: getNDVIColor(ndvi) }}
              >
                  {getNDVILabel(ndvi)}
              </div>
          </div>
      </div>
    </div>
  );
};

// --- REFLECTANCE CALCULATOR (NEW) ---
export const ReflectanceCalculator: React.FC = () => {
  const [dn, setDn] = useState(20000); // Digital Number
  const [mult, setMult] = useState(0.00002); // Standard Landsat 8 multiplier
  const [add, setAdd] = useState(-0.1); // Standard Landsat 8 additive
  const [sunElev, setSunElev] = useState(45); // Sun Elevation in degrees

  // Formula: ρλ' = Mρ * Qcal + Aρ
  // Corrected for Sun Angle: ρλ = ρλ' / sin(θSE)
  const toaReflectance = (mult * dn) + add;
  const correctedReflectance = toaReflectance / Math.sin(sunElev * (Math.PI / 180));

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
      <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold flex items-center gap-2">
        <Calculator size={18} className="text-earth-blue"/> Calculadora Reflectancia
      </h3>
      <p className="text-xs text-gray-500 mb-4">Conversión de ND a Reflectancia TOA (Landsat 8)</p>

      <div className="space-y-4 mb-4 text-xs">
        <ControlTooltip text="Digital Number (ND): Valor crudo del pixel en la imagen original (0-65535).">
            <div>
               <label className="block text-gray-500 font-bold mb-1 flex items-center gap-1">Digital Number (DN): {dn} <Info size={10}/></label>
               <input 
                 type="range" min="0" max="65535" step="100" value={dn} 
                 onChange={(e) => setDn(parseInt(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-earth-blue hover:accent-blue-700 transition-colors"
               />
            </div>
        </ControlTooltip>

        <div className="grid grid-cols-2 gap-2">
           <ControlTooltip text="REFLECTANCE_MULT_BAND_x: Factor de reescalado multiplicativo (Metadatos MTL).">
               <div>
                 <label className="block text-gray-400 mb-1 flex items-center gap-1">Mult (M) <Info size={10}/></label>
                 <input type="number" step="0.00001" value={mult} onChange={(e)=>setMult(parseFloat(e.target.value))} className="w-full border rounded p-1 focus:ring-1 focus:ring-earth-blue outline-none transition-shadow"/>
               </div>
           </ControlTooltip>
           <ControlTooltip text="REFLECTANCE_ADD_BAND_x: Factor de reescalado aditivo (Metadatos MTL).">
               <div>
                 <label className="block text-gray-400 mb-1 flex items-center gap-1">Add (A) <Info size={10}/></label>
                 <input type="number" step="0.1" value={add} onChange={(e)=>setAdd(parseFloat(e.target.value))} className="w-full border rounded p-1 focus:ring-1 focus:ring-earth-blue outline-none transition-shadow"/>
               </div>
           </ControlTooltip>
        </div>
        
        <ControlTooltip text="SUN_ELEVATION: Ángulo de elevación solar al momento de la captura. Corrige la iluminación.">
            <div>
               <label className="block text-gray-500 font-bold mb-1 flex items-center gap-1">Elevación Solar: {sunElev}° <Info size={10}/></label>
               <input 
                 type="range" min="10" max="90" step="1" value={sunElev} 
                 onChange={(e) => setSunElev(parseInt(e.target.value))}
                 className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-600 transition-colors"
               />
            </div>
        </ControlTooltip>
      </div>

      <div className="mt-auto bg-gray-900 text-white p-4 rounded-lg shadow-inner">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-xs text-gray-400">Reflectancia (TOA)</span>
              <span className="text-lg font-mono">{toaReflectance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
              <span className="text-xs text-earth-accent font-bold">Corregida (Solar)</span>
              <span className="text-xl font-mono font-bold text-earth-accent">{Math.max(0, Math.min(1, correctedReflectance)).toFixed(4)}</span>
          </div>
      </div>
    </div>
  );
};

// --- SPECTRAL SIGNATURE PLOTTER (IMPROVED) ---
export const SpectralSignaturePlot: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Data: Wavelength (nm), Reflectance (%)
  const dataPoints = {
    vegetation: [ {x: 450, y: 5}, {x: 550, y: 15}, {x: 670, y: 5}, {x: 800, y: 50}, {x: 1600, y: 25} ],
    soil: [ {x: 450, y: 10}, {x: 550, y: 15}, {x: 670, y: 20}, {x: 800, y: 25}, {x: 1600, y: 35} ],
    water: [ {x: 450, y: 8}, {x: 550, y: 6}, {x: 670, y: 2}, {x: 800, y: 0}, {x: 1600, y: 0} ]
  };

  // SVG Scaling
  const width = 100;
  const height = 60;
  const padding = 5;
  const maxY = 60; // max reflectance

  const makePath = (points: {x:number, y:number}[]) => {
      const d = points.map((p, i) => {
          // Scale x from 400-1700 to 0-100 width
          const sx = ((p.x - 400) / 1300) * (width - padding * 2) + padding;
          // Scale y from 0-60 to height-0
          const sy = height - padding - (p.y / maxY) * (height - padding * 2);
          return `${i===0?'M':'L'} ${sx} ${sy}`;
      }).join(" ");
      return d;
  };

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
      <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold flex items-center gap-2">
        <Activity size={18} className="text-earth-blue"/> Firmas Espectrales
      </h3>
      <p className="text-xs text-gray-500 mb-4">Reflectancia típica (%) vs Longitud de Onda (nm)</p>

      <div className="relative w-full aspect-[2/1] bg-gray-50 rounded border border-gray-200 mb-4 overflow-hidden cursor-crosshair group">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
              {/* Grid */}
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#ccc" strokeWidth="0.5" />
              <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#ccc" strokeWidth="0.5" />

              {/* Paths */}
              <path d={makePath(dataPoints.vegetation)} fill="none" stroke="green" strokeWidth="1" className="transition-all duration-300 hover:stroke-[2] hover:drop-shadow-md" onMouseEnter={()=>setHoveredPoint('Veg')} onMouseLeave={()=>setHoveredPoint(null)} />
              <path d={makePath(dataPoints.soil)} fill="none" stroke="#A16207" strokeWidth="1" strokeDasharray="2,1" className="transition-all duration-300 hover:stroke-[2] hover:drop-shadow-md" onMouseEnter={()=>setHoveredPoint('Suelo')} onMouseLeave={()=>setHoveredPoint(null)} />
              <path d={makePath(dataPoints.water)} fill="none" stroke="blue" strokeWidth="1" className="transition-all duration-300 hover:stroke-[2] hover:drop-shadow-md" onMouseEnter={()=>setHoveredPoint('Agua')} onMouseLeave={()=>setHoveredPoint(null)} />
          </svg>
          
          {hoveredPoint && (
              <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none animate-fade-in">
                  {hoveredPoint}
              </div>
          )}
      </div>

      <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 cursor-help" title="Pico en NIR, baja en Rojo"><div className="w-3 h-0.5 bg-green-600"></div> Vegetación</div>
          <div className="flex items-center gap-1 cursor-help" title="Aumenta gradualmente"><div className="w-3 h-0.5 bg-yellow-700 border-t border-dashed border-yellow-700"></div> Suelo</div>
          <div className="flex items-center gap-1 cursor-help" title="Baja reflectancia general"><div className="w-3 h-0.5 bg-blue-600"></div> Agua</div>
      </div>
    </div>
  );
}

// --- SPATIAL RESOLUTION COMPARATOR (NEW) ---
export const ResolutionComparator: React.FC = () => {
    const [res, setRes] = useState(1); // 0: 30m, 1: 10m, 2: 1m

    const resolutions = [
        { label: "30m (Landsat)", pixelSize: 20, blur: "4px" },
        { label: "10m (Sentinel)", pixelSize: 8, blur: "1px" },
        { label: "1m (Drone/Lidar)", pixelSize: 1, blur: "0px" }
    ];

    const current = resolutions[res];

    return (
        <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
             <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold flex items-center gap-2">
                <Maximize size={18} className="text-earth-blue"/> Resolución Espacial
            </h3>
            <p className="text-xs text-gray-500 mb-4">Compara el nivel de detalle según el tamaño de pixel.</p>

            <div className="flex-1 relative bg-gray-200 rounded-lg overflow-hidden mb-4 group shadow-inner border border-gray-200">
                 {/* Simulated Satellite Image using CSS patterns */}
                 <div 
                    className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center transition-all duration-500"
                    style={{ 
                        filter: `pixelate(${current.pixelSize}px) blur(${current.blur})`,
                        transform: 'scale(1.5)'
                    }}
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     {/* Grid overlay to show pixels */}
                     <div 
                        className="w-full h-full opacity-50" 
                        style={{ 
                            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: `${current.pixelSize * 4}px ${current.pixelSize * 4}px`
                        }}
                     ></div>
                 </div>
                 <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                     {current.label}
                 </div>
            </div>

            <ControlTooltip text="Desliza para cambiar entre resoluciones de satélite comunes (Landsat, Sentinel, Alta Resolución).">
                <input 
                    type="range" min="0" max="2" step="1" 
                    value={res} 
                    onChange={(e) => setRes(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-earth-blue hover:accent-blue-700 transition-colors"
                />
            </ControlTooltip>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Baja</span>
                <span>Media</span>
                <span>Alta</span>
            </div>
        </div>
    )
}

// --- BAND COMBINATOR (IMPROVED VISUALS) ---
export const BandCombinator: React.FC = () => {
  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
      <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold flex items-center gap-2">
        <Eye size={18} className="text-earth-blue"/> Combinación de Bandas
      </h3>
      <p className="text-xs text-gray-500 mb-4">Landsat 8 (R-G-B)</p>
      
      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {/* True Color */}
        <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-default group">
           <div className="w-16 h-16 rounded-md bg-[url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200')] bg-cover shadow-sm group-hover:shadow-md transition-shadow"></div>
           <div>
               <div className="font-bold text-earth-dark text-sm">Color Real (4-3-2)</div>
               <div className="text-xs text-gray-500">Similar a la visión humana. Bueno para áreas urbanas y agua.</div>
           </div>
        </div>

        {/* False Color Infrared */}
        <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-default group">
           <div className="w-16 h-16 rounded-md bg-red-900 relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200')] bg-cover opacity-50 grayscale mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-red-500 mix-blend-hue opacity-60"></div>
           </div>
           <div>
               <div className="font-bold text-earth-dark text-sm">Infrarrojo (5-4-3)</div>
               <div className="text-xs text-gray-500">Vegetación en rojo. Salud vegetal y cuerpos de agua.</div>
           </div>
        </div>

         {/* Agriculture */}
         <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-default group">
           <div className="w-16 h-16 rounded-md bg-green-800 relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200')] bg-cover opacity-50 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-green-400 mix-blend-color opacity-70"></div>
           </div>
           <div>
               <div className="font-bold text-earth-dark text-sm">Agricultura (6-5-2)</div>
               <div className="text-xs text-gray-500">Vegetación en verde brillante. Diferencia tipos de cultivo.</div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- WORKFLOW DIAGRAM ---
export const WorkflowDiagram: React.FC = () => {
  return (
    <div className="hidden md:flex justify-between items-center gap-4 w-full p-6 bg-white/50 rounded-xl border border-earth-blue/5 backdrop-blur-sm opacity-80 hover:opacity-100 transition-all duration-500 hover:shadow-lg">
         <div className="text-center group">
            <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">🛰️</div>
            <div className="text-xs font-bold text-gray-600 group-hover:text-earth-blue">Captura</div>
         </div>
         <div className="h-0.5 bg-gray-300 flex-1 rounded-full"></div>
         <div className="text-center group">
            <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">💾</div>
            <div className="text-xs font-bold text-gray-600 group-hover:text-earth-blue">Descarga</div>
         </div>
         <div className="h-0.5 bg-gray-300 flex-1 rounded-full"></div>
         <div className="text-center group">
            <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">⚙️</div>
            <div className="text-xs font-bold text-gray-600 group-hover:text-earth-blue">Pre-proceso</div>
         </div>
         <div className="h-0.5 bg-gray-300 flex-1 rounded-full"></div>
         <div className="text-center group">
            <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">📊</div>
            <div className="text-xs font-bold text-gray-600 group-hover:text-earth-blue">Análisis</div>
         </div>
    </div>
  )
}

// --- COMMAND REFERENCE TABLE (EXPANDED) ---
export const CommandReference: React.FC = () => {
    const [filter, setFilter] = useState('');
    
    const commands = [
        { cmd: "i.vi", desc: "Calcula índices de vegetación (NDVI, etc).", type: "Imagery" },
        { cmd: "r.mapcalc", desc: "Calculadora de mapas ráster.", type: "Raster" },
        { cmd: "r.recode", desc: "Recodifica categorías ráster.", type: "Raster" },
        { cmd: "r.report", desc: "Estadísticas de área.", type: "Raster" },
        { cmd: "v.buffer", desc: "Crea áreas de influencia.", type: "Vector" },
        { cmd: "Zonal Stats", desc: "Estadísticas ráster en polígonos.", type: "Analysis" },
        { cmd: "Rasterize", desc: "Vector a ráster.", type: "Conversion" },
        { cmd: "Clip by Mask", desc: "Recorte con máscara.", type: "Extraction" },
        { cmd: "Hillshade", desc: "Mapa de sombras.", type: "Terrain" },
        { cmd: "Slope", desc: "Pendiente (grados/%)", type: "Terrain" },
        { cmd: "r.regression.line", desc: "Regresión lineal y = a + bx", type: "Stats" },
        { cmd: "i.pansharpen", desc: "Fusión pancromática.", type: "Imagery" },
        { cmd: "Merge", desc: "Mosaico de imágenes.", type: "Misc" },
        { cmd: "i.cluster", desc: "Firmas espectrales (no supervisada).", type: "Imagery" },
        { cmd: "i.maxlik", desc: "Clasificación Máxima Verosimilitud.", type: "Imagery" },
        { cmd: "i.pca", desc: "Análisis de Componentes Principales.", type: "Imagery" },
        { cmd: "r.colors", desc: "Modifica tabla de colores.", type: "Raster" },
        { cmd: "v.clean", desc: "Limpia topología vectorial.", type: "Vector" },
        { cmd: "v.dissolve", desc: "Disuelve límites por atributo.", type: "Vector" },
        { cmd: "v.to.rast", desc: "Convierte vector a ráster.", type: "Conversion" },
    ];

    const filteredCommands = commands.filter(c => 
        c.cmd.toLowerCase().includes(filter.toLowerCase()) || 
        c.desc.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-earth-blue/20 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
            <div className="p-6 bg-earth-light border-b border-earth-blue/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-serif text-lg text-earth-dark font-bold flex items-center gap-2">
                      <Terminal size={18} className="text-earth-blue"/> Comandos
                    </h3>
                </div>
                <div className="relative w-full md:w-32 group">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-earth-blue transition-colors" size={12} />
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="w-full pl-8 pr-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-earth-blue focus:ring-1 focus:ring-earth-blue text-xs transition-shadow"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[300px] custom-scrollbar">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-5 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-3 font-bold text-earth-dark border-b bg-gray-50">Cmd</th>
                            <th className="p-3 font-bold text-earth-dark border-b bg-gray-50">Desc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map((c, idx) => (
                                <tr key={idx} className="hover:bg-earth-light/50 border-b last:border-0 transition-colors">
                                    <td className="p-3 font-mono font-bold text-earth-blue whitespace-nowrap">{c.cmd}</td>
                                    <td className="p-3 text-gray-600">{c.desc}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="p-6 text-center text-gray-400 italic">...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- HILLSHADE SIMULATOR (NEW) ---
export const HillshadeSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [azimuth, setAzimuth] = useState(315);
  const [altitude, setAltitude] = useState(45);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Terrain function: Gaussian
    const getZ = (x: number, y: number) => {
        const dx = x - width / 2;
        const dy = y - height / 2;
        return 100 * Math.exp(-(dx * dx + dy * dy) / 2000);
    };

    const zenithRad = (90 - altitude) * Math.PI / 180;
    const azimuthRad = (azimuth - 360 + 90) * Math.PI / 180; // Adjust to math standard

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Finite difference for slope
            const z0 = getZ(x, y);
            const zx = getZ(x + 1, y);
            const zy = getZ(x, y + 1);
            
            const dzdx = zx - z0;
            const dzdy = zy - z0;

            const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
            let aspectRad = Math.atan2(dzdy, -dzdx);
            if (aspectRad < 0) aspectRad += 2 * Math.PI;

            // Hillshade formula
            // Hillshade = 255.0 * ((cos(Zenith_rad) * cos(Slope_rad)) + (sin(Zenith_rad) * sin(Slope_rad) * cos(Azimuth_rad - Aspect_rad)))
            
            let hillshade = 255 * ( (Math.cos(zenithRad) * Math.cos(slopeRad)) + (Math.sin(zenithRad) * Math.sin(slopeRad) * Math.cos(azimuthRad - aspectRad)) );
            
            hillshade = Math.max(0, Math.min(255, hillshade));

            const index = (y * width + x) * 4;
            data[index] = hillshade;     // R
            data[index + 1] = hillshade; // G
            data[index + 2] = hillshade; // B
            data[index + 3] = 255;       // A
        }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [azimuth, altitude]);

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-earth-blue/20 h-full hover:shadow-md transition-shadow duration-300">
      <h3 className="font-serif text-lg mb-2 text-earth-dark font-bold flex items-center gap-2">
        <Sun size={18} className="text-earth-blue"/> Sombreado (Hillshade)
      </h3>
      <p className="text-xs text-gray-500 mb-4">Simulación de iluminación del terreno.</p>
      
      <div className="flex justify-center mb-4 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
         <canvas ref={canvasRef} width={200} height={150} className="w-full h-auto" style={{ imageRendering: 'pixelated' }}></canvas>
      </div>

      <div className="space-y-4 text-xs mt-auto">
         <ControlTooltip text="Dirección de la luz solar (grados). 0=Norte, 90=Este. Estándar: 315° (NO).">
             <div>
                <label className="flex justify-between font-bold text-gray-500 mb-1">
                    <span className="flex items-center gap-1">Azimut (Sol) <Info size={10}/></span>
                    <span>{azimuth}°</span>
                </label>
                <input 
                    type="range" min="0" max="360" step="1" 
                    value={azimuth} onChange={(e) => setAzimuth(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-colors"
                />
             </div>
         </ControlTooltip>
         <ControlTooltip text="Ángulo vertical del sol sobre el horizonte. 90° = Cenit (arriba). Estándar: 45°.">
             <div>
                <label className="flex justify-between font-bold text-gray-500 mb-1">
                    <span className="flex items-center gap-1">Altitud (Sol) <Info size={10}/></span>
                    <span>{altitude}°</span>
                </label>
                <input 
                    type="range" min="0" max="90" step="1" 
                    value={altitude} onChange={(e) => setAltitude(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-600 transition-colors"
                />
             </div>
         </ControlTooltip>
      </div>
    </div>
  );
};

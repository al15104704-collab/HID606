
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { HeroScene } from './components/QuantumScene';
import {
  NDVICalculator,
  CommandReference,
  WorkflowDiagram,
  SpectralSignaturePlot,
  BandCombinator,
  ResolutionComparator,
  ReflectanceCalculator,
  HillshadeSimulator
} from './components/Diagrams';
import { ArrowDown, Menu, X, Globe, Layers, Download, BookOpen, Code, ExternalLink, Copy, FileText, Cpu, Activity, Map as MapIcon, GraduationCap, Briefcase, Wrench, Award, User, Mail, Phone, Play, Clock, Camera, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// --- DATA ---

const AUTHOR_NAME = "Ing. Carlos Armando Corona Solano";
const CURRENT_YEAR = "2025";

type PracticeDetail = {
  id: string;
  title: string;
  description: string;
  image?: string;
  steps: { title: string; content: string; image?: string; code?: string }[];
};

const softwareLinks = [
  { name: "7-Zip", url: "https://www.7-zip.org/", desc: "Compresor de archivos (v19.00+)", icon: "🗜️" },
  { name: "Notepad++", url: "https://notepad-plus-plus.org/downloads/", desc: "Editor de texto y código (v8.1.4+)", icon: "📝" },
  { name: "QGIS LTR", url: "https://qgis.org/es/site/forusers/download.html", desc: "Sistema de Información Geográfica (v3.22+)", icon: "🌍" },
  { name: "R Project", url: "https://cran.r-project.org/bin/windows/base/", desc: "Lenguaje de programación estadística", icon: "R" },
  { name: "RStudio", url: "https://www.rstudio.com/products/rstudio/download/", desc: "IDE para R", icon: "💻" },
  { name: "USGS GloVis", url: "https://glovis.usgs.gov/", desc: "Descarga de imágenes Landsat/Sentinel", icon: "🛰️" },
  { name: "NASA EarthData", url: "https://earthdata.nasa.gov/", desc: "Descarga de productos MODIS", icon: "🌌" },
  { name: "INEGI CEM", url: "https://www.inegi.org.mx/app/geo2/elevacionesmex/", desc: "Continuo de Elevaciones Mexicano", icon: "⛰️" }
];

const pythonScripts = {
  "WB.py": `
# Script para generar un Working Box a un porcentaje
# Autor: Felipe Pedraza Oropeza
# Fecha: 02-marzo-2022

from qgis.PyQt.QtCore import QVariant
# Se inicializa el código de error
err_code=0
# Se define el porcentaje de los márgenes
mp=20.0 

# Se genera el Working Box
# Nota: Asegurarse que la capa vectorial esté activa
layer = iface.activeLayer()
provider = layer.dataProvider()
extent = provider.extent()
# ... (Cálculo de coordenadas extremas y buffer)
  `,
  "get_grd_extent.py": `
# Script para obtener la extensión de una malla
layer = iface.activeLayer()
provider = layer.dataProvider()
extent = provider.extent()
rows = layer.height()
cols = layer.width()
print(f"Extensión: {extent.xMinimum()}, {extent.xMaximum()}, {extent.yMinimum()}, {extent.yMaximum()}")
  `,
  "slr_ls_mod.py": `
# Script para calcular la línea de suelo (Regresión Lineal)
# Requiere: Máscara (0/1) y Stack Layer (Bandas)
import numpy as np

def get_slr():
    layer = iface.activeLayer()
    # ... (Lógica completa de regresión lineal entre RED y NIR) ...
    # Cálculo de la pendiente (gain) y el offset
    print("y = a + b * x")
  `,
  "estadisticas_2.py": `
# Cálculo de estadísticas básicas pixel a pixel
# Iteración sobre filas y columnas
block = provider.block(1, extent, cols, rows)
maxv = block.value(1,1)
minv = block.value(1,1)
suma = 0
count = 0

for i in range(rows):
    for j in range(cols):
        val = block.value(i,j)
        if val > maxv: maxv = val
        if val < minv: minv = val
        suma += val
        count += 1

media = suma / count
print(f"Max: {maxv}, Min: {minv}, Media: {media}")
  `
};

const practiceData: Record<string, PracticeDetail> = {
  "1": {
    id: "1",
    title: "Introducción a Sensores Remotos e Instalación",
    description: "Fundamentos conceptuales, evaluación, requerimientos técnicos y configuración del entorno de trabajo (QGIS, Pandoc, TeX Live).",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200",
    steps: [
      {
        title: "I. Contexto y Metodología",
        content: "El curso HID-608 (4 créditos) se imparte en modalidad presencial y a distancia. \n\nEstructura de Evaluación:\n- Manual del Curso: 50%\n- Tareas: 15%\n- Trabajo Final: 10%\n- Exámenes Parciales: 10%\n- Examen Final: 15%\n\nNota Importante: La calificación aplica una comparación estricta de cadenas (sensible a mayúsculas/minúsculas y espacios), crucial para la sintaxis en programación (Python)."
      },
      {
        title: "II. Fundamentos Conceptuales (Vectores y Ráster)",
        content: "Modelos de Datos Espaciales:\n\n1. Información Vectorial: Representa objetos (puntos, líneas, polígonos). Archivos indispensables: .shp (geometría), .shx (índice), .dbf (atributos), .prj (proyección).\n\n2. Información Ráster: Matriz de píxeles (celdas) con valores. Formato común: GeoTIFF."
      },
      {
        title: "II. Sistemas de Coordenadas e Índices",
        content: "SCR: Define la relación mapa-tierra. En México se usan UTM y Cónica Conforme de Lambert.\n\nÍndices de Vegetación:\n- SR (Simple Ratio): NIR/RED.\n- NDVI: (NIR-RED)/(NIR+RED). Rango -1 a 1.\n\nTipos de Datos: Bit (0-1), Byte (0-255). Rangos: Corchete '[' (cerrado/incluye), Paréntesis ')' (abierto/excluye)."
      },
      {
        title: "III. Requerimientos y Registro",
        content: "Requisitos:\n- PC Windows 64-bits.\n- Cuentas requeridas: Moodle, USGS Glovis (Nivel 1), USGS EarthExplorer (Nivel 2 recomendado), Google Earth Engine, ChatGPT (IA)."
      },
      {
        title: "IV. Instalación Básica",
        content: "1. Crear carpeta raíz: 'C:\\hid-608'.\n2. Instalar 7-Zip (64 bits) para gestión de archivos comprimidos.\n3. Instalar QGIS 3.22+ y configurar en 'American English'."
      },
      {
        title: "IV. Instalación Avanzada (Pandoc y TeX Live)",
        content: "Para generación de textos científicos y conversión de fórmulas LaTeX.\n\nInstalación en Windows/Ubuntu (WSL):\n1. Ejecutar PowerShell como administrador.\n2. En Ubuntu: `sudo apt update && sudo apt upgrade`.\n3. Instalar Pandoc: `sudo apt install pandoc -y`.\n4. Instalar TeX Live (puede tardar ~5 min).\n\nVerificación: Descargar 'savi.tex' a 'C:\\HID-608' y ejecutar:",
        code: "pandoc -f latex -t docx -o /mnt/c/HID-608/savi.docx /mnt/c/HID-608/savi.tex"
      },
      {
        title: "V. Tarea Práctica 1: Vectores",
        content: "Buscar y descargar archivos Shapefile de:\na) Países del mundo.\nb) Municipios de México (Disponible en CONABIO: http://www.conabio.gob.mx/informacion/gis/, versión 1:250000, 2020).\nc) Zona económica exclusiva de México."
      }
    ]
  },
  "2": {
    id: "2",
    title: "Base de Datos y Selección",
    description: "Manipulación de tablas de atributos, expresiones regulares y selección de imágenes por ubicación.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "2.1 Carga y Exploración", content: "Cargar el archivo vector 'Centroide_25-47.shp'. Abrir la tabla de atributos y activar el modo de edición (lápiz)." },
      { title: "2.2 Calculadora de Campos (Conteo)", content: "Crear campo 'Opcion_0' (Entero). Usar expresión: `array_length(string_to_array(\"VALORES\"))` para contar elementos en la celda." },
      { title: "2.3 Expresiones Regulares", content: "Crear campo 'Opcion_1'. Usar expresión: `length(regexp_replace(\"VALORES\", '[^,]', '')) + 1` para contar comas y deducir elementos." },
      { title: "2.4 Selección por Atributo", content: "Filtrar imágenes que cumplan criterios específicos de nubosidad (menor al 10%) usando los metadatos contenidos en la tabla." }
    ]
  },
  "3": {
    id: "3",
    title: "Descarga Landsat 8",
    description: "Uso de la plataforma USGS GloVis para obtener imágenes satelitales de Puebla y Veracruz.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "3.1 Acceso a GloVis", content: "Ingresar a https://glovis.usgs.gov/. Iniciar sesión con cuenta EROS/USGS. En 'Interface Controls', seleccionar 'Landsat 8 OLI/TIRS C1 Level-1'." },
      { title: "3.2 Filtros de Búsqueda", content: "En 'Common Metadata Filters', establecer rango de fechas (2018) y nubosidad (0-10%). Ir a 'Jump To Location', ingresar Path: 025, Row: 047 (Zona Puebla/Veracruz)." },
      { title: "3.3 Descarga de Escenas", content: "Seleccionar la imagen del 04/02/2018 (LC08_L1TP_025047_20180204...). Clic en 'Download' > 'Level-1 GeoTIFF Data Product'. Repetir para las 10 imágenes restantes del año." }
    ]
  },
  "4": {
    id: "4",
    title: "Procesamiento Landsat 8",
    description: "Corrección atmosférica DOS1, Stack Layer, recorte (Working Box) y cálculo de NDVI.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "4.1 Corrección Atmosférica (SCP)", content: "Abrir SCP > Preprocessing > Landsat. Seleccionar directorio con bandas extraídas y archivo MTL.txt. Marcar 'Apply DOS1 atmospheric correction' y 'Create Band Set'." },
      { title: "4.2 Stack Raster", content: "En SCP > Band set, seleccionar las bandas corregidas (reflectancia). Clic en 'Stack raster bands'. Guardar como 'L8_2547_20180204s6'." },
      { title: "4.3 Working Box (Script)", content: "Cargar capa vectorial del Distrito 030. Abrir consola Python, cargar script 'WB.py'. Establecer mp=20.0. Ejecutar para crear polígono 'wb20'." },
      { title: "4.4 Recorte (Clip)", content: "Ir a Raster > Extracción > Cortar ráster por capa de máscara. Capa de entrada: Imagen Landsat Stack. Máscara: wb20. Ejecutar para obtener la imagen recortada de la zona de interés." },
      { title: "4.5 Cálculo de NDVI", content: "Abrir Calculadora Raster. Usar fórmula `(Banda5 - Banda4) / (Banda5 + Banda4)` (NIR - RED / NIR + RED). Guardar como 'NDVI.tif'." }
    ]
  },
  "5": {
    id: "5",
    title: "Análisis Estadístico",
    description: "Comparación de métodos de extracción de estadísticas (Zonal Statistics vs EstadParcelas).",
    image: "https://images.unsplash.com/photo-1543286386-713df548e9cc?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "5.1 Zonal Statistics (QGIS)", content: "Cargar capa de parcelas y ráster NDVI. Ir a Procesos > Estadísticas de zona. Prefijo 'zonal_'. Estadísticas: Media, Desviación Estándar. Ejecutar." },
      { title: "5.2 EstadParcelas (Externo)", content: "Convertir NDVI a formato .rst (Idrisi) usando GDAL Translate (Raster > Conversión > Traducir). Abrir 'EstadParcelas.exe'. Seleccionar archivo .rst y shapefile de parcelas. Ejecutar para obtener CSV." },
      { title: "5.3 Correlación en R", content: "Exportar tablas de atributos a CSV. En RStudio, cargar datos y ejecutar `cor(datos$EstadParcelas, datos$Zonal, method='pearson')`. Comparar precisión con media ponderada real." }
    ]
  },
  "6": {
    id: "6",
    title: "Clasificación y Sentinel-2",
    description: "Pansharpening, Clasificación no supervisada (K-means/ISODATA) y comparación.",
    image: "https://images.unsplash.com/photo-1535385793343-27dff1413c5a?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "6.1 Pansharpening", content: "En SCP > Preprocessing > Landsat, marcar 'Perform pansharpening'. Esto fusiona las bandas multiespectrales (30m) con la pancromática (15m) para obtener 15m de resolución." },
      { title: "6.2 Clasificación No Supervisada", content: "Ir a SCP > Band processing > Clustering. Seleccionar Input Band Set. Método: K-means o ISODATA. Clases: 5. Iteraciones: 10. Ejecutar." },
      { title: "6.3 Comparación de Algoritmos", content: "Comparar visualmente y estadísticamente los resultados de K-means vs ISODATA para la identificación de cultivos en el Distrito 030." }
    ]
  },
  "7": {
    id: "7",
    title: "Mosaicos de Imágenes",
    description: "Creación de mosaicos espaciales a partir de escenas MODIS para cubrir grandes extensiones territoriales.",
    image: "https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "7.1 Descarga de Escenas", content: "Acceder a NASA EarthData Search o FAS USDA. Buscar producto MOD09GA (Reflectancia). Descargar tiles h08v05, h08v06, h09v05, h09v06 que cubren México." },
      { title: "7.2 Reproyección", content: "Las imágenes MODIS vienen en proyección Sinusoidal. Usar Raster > Proyecciones > Combar (Reproyectar) a WGS84 o Lambert Conformal Conic." },
      { title: "7.3 Mosaico (Merge)", content: "Ir a Raster > Miscelánea > Combinar. Seleccionar las escenas reproyectadas. Generar un solo archivo continuo para el país." },
      { title: "7.4 Recorte Nacional", content: "Cargar shapefile de México (dest20gw.shp). Usar Raster > Extracción > Cortar ráster por capa de máscara. Generar 'Mosaico_Nacional.tif' y aplicar Hillshade para relieve." }
    ]
  },
  "8": {
    id: "8",
    title: "Modelos Digitales (DEM)",
    description: "Manejo del Continuo de Elevaciones Mexicano (CEM), generación de sombras, pendientes y curvas de nivel.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "8.1 Descarga CEM", content: "Ir al sitio de INEGI > Geografía > relieve. Descargar el CEM 3.0 (resolución 90m GEMA o 15m) para la zona de interés. Formato .bil o .tif." },
      { title: "8.2 Mapa de Sombras (Hillshade)", content: "En QGIS: Raster > Análisis > Mapa de sombras. Input: DEM. Azimut: 315, Altitud: 45. Factor Z: 1 (si proyección es métrica). Esto resalta el relieve." },
      { title: "8.3 Pendientes (Slope)", content: "Raster > Análisis > Pendiente. Calcular en grados o porcentaje. Útil para análisis hidrológico y de aptitud de cultivos." },
      { title: "8.4 Curvas de Nivel", content: "Raster > Extracción > Curvas de nivel. Intervalo: 10m o 50m según el relieve. Genera vectores lineales de altitud constante." }
    ]
  },
  "9": {
    id: "9",
    title: "Procesamiento Sentinel-2",
    description: "Flujo completo para imágenes Sentinel-2: descarga, corrección y comparación con Landsat.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    steps: [
      { title: "9.1 Descarga", content: "En GloVis, seleccionar 'Sentinel-2'. Buscar zona (usar MGRS tiles). Descargar producto L1C (ToA Reflectance)." },
      { title: "9.2 Corrección Atmosférica", content: "En SCP > Preprocessing > Sentinel-2. Seleccionar directorio con subcarpetas .SAFE. SCP detecta automáticamente las bandas 10m, 20m y 60m. Aplicar DOS1." },
      { title: "9.3 Re-muestreo y Stack", content: "Sentinel tiene bandas de diferentes resoluciones. Generar un Stack Layer seleccionando las bandas de interés (10m y 20m) resampleadas a 10m." },
      { title: "9.4 Comparativa NDVI", content: "Calcular NDVI Sentinel (10m) y comparar con Landsat (30m). Notar la mayor definición en bordes de parcelas y caminos." }
    ]
  }
};

const proceduresData = [
  {
    title: "Descompresión",
    desc: "Uso de 7-Zip para extraer archivos .tar.gz y .zip.",
    image: "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Importar Vector",
    desc: "Capa > Añadir Capa > Añadir Capa Vectorial (.shp).",
    image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Importar Ráster",
    desc: "Capa > Añadir Capa > Añadir Capa Ráster (.tif, .img).",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Corrección SCP",
    desc: "Plugin SCP > Preprocessing > Landsat/Sentinel > Select Directory > Run.",
    image: "https://images.unsplash.com/photo-1461301214746-1e790926d323?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Stack Layer",
    desc: "SCP > Band set > Refresh list > Select bands > Create virtual raster of band set.",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Recorte (Clip)",
    desc: "Raster > Extracción > Cortar ráster por capa de máscara.",
    image: "https://images.unsplash.com/photo-1542206395228-a6251c47d1c2?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Calculadora Ráster",
    desc: "Raster > Calculadora Ráster. Operaciones aritméticas entre bandas.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Mosaico",
    desc: "Raster > Miscelánea > Combinar (Merge).",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Reproyección",
    desc: "Raster > Proyecciones > Combar (Reproyectar). De WGS84 a Lambert (CCL).",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Hillshade",
    desc: "Raster > Análisis > Mapa de sombras.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400"
  }
];

// --- COMPONENTS ---

const IntroductionCard = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-earth-blue/10 p-8 mb-16 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-earth-green/10 rounded-bl-full -mr-10 -mt-10"></div>
    <h2 className="font-serif text-3xl text-earth-dark mb-4 flex items-center gap-3">
      <FileText className="text-earth-blue" /> Carta de Presentación
    </h2>
    <p className="text-gray-600 leading-relaxed text-lg">
      Bienvenido al manual interactivo del curso <strong>HID-608: Introducción a los Sensores Remotos</strong>.
      Este recurso digital ha sido diseñado para guiar a los estudiantes del posgrado en Hidrociencias
      a través del complejo flujo de trabajo del procesamiento de imágenes satelitales.
    </p>
    <p className="text-gray-600 leading-relaxed text-lg mt-4">
      Desde la adquisición de datos en plataformas globales hasta la generación de productos de valor agregado
      como índices de vegetación y clasificaciones de uso de suelo, este portal centraliza herramientas,
      scripts y procedimientos estandarizados para el análisis territorial en México.
    </p>
    <div className="mt-6 flex gap-4">
      <div className="px-4 py-2 bg-earth-blue/10 text-earth-blue rounded-full text-sm font-bold">Versión 2025</div>
      <div className="px-4 py-2 bg-earth-green/10 text-earth-green rounded-full text-sm font-bold">QGIS 3.22+</div>
    </div>
  </div>
);

const InfographicGallery = ({ onImageClick }: { onImageClick: (url: string, title: string) => void }) => {
  const infographics = [
    {
      title: "Guía de Inicio: Práctica 1",
      desc: "Fase 1: Preparación del entorno y Fase 2: Conceptos fundamentales.",
      url: "https://i.postimg.cc/0ydmVfrL/unnamed.png",
      tag: "Práctica 1"
    },
    {
      title: "Guía Visual: Práctica 2",
      desc: "Adquisición de datos satelitales (Landsat/Modis) y preparación del espacio de trabajo.",
      url: "https://i.postimg.cc/g2P8y5cf/unnamed-(1).png",
      tag: "Práctica 2"
    },
    {
      title: "Manipulación de Datos (Práctica 3)",
      desc: "Guía detallada de herramientas, calculadora de campos y expresiones.",
      url: "https://i.postimg.cc/T3mQfg1C/unnamed-(10).png",
      tag: "Práctica 3"
    },
    {
      title: "Flujo de Trabajo General",
      desc: "Preparación, Procesamiento, Cálculo de Índices y Clasificación.",
      url: "https://i.postimg.cc/C53DQrGw/unnamed-(2).png",
      tag: "Workflow"
    },
    {
      title: "Práctica 5: Clasificación",
      desc: "Clasificación No Supervisada vs Supervisada. Algoritmos K-means e ISODATA.",
      url: "https://i.postimg.cc/fyGXrqc3/unnamed-(3).png",
      tag: "Práctica 5"
    },
    {
      title: "Análisis de Vegetación (NDVI)",
      desc: "Corrección atmosférica, creación de Stack, recorte y cálculo de NDVI.",
      url: "https://i.postimg.cc/SR2CVbMb/unnamed-(5).png",
      tag: "NDVI"
    },
    {
      title: "Clasificación Supervisada (Práctica 6)",
      desc: "Muestreo aleatorio estratificado, creación de mapa temático y evaluación de precisión (Kappa).",
      url: "https://i.postimg.cc/Xqmc0Y01/unnamed-(6).png",
      tag: "Práctica 6"
    },
    {
      title: "Kit de Herramientas",
      desc: "Resumen de modelos de datos, herramientas QGIS y automatización con Python.",
      url: "https://i.postimg.cc/wMZcdjp8/unnamed-(7).png",
      tag: "Toolkit"
    },
    {
      title: "Proyecto: Guía Paso a Paso",
      desc: "Etapas del proyecto de sensores remotos: Preparación, Análisis y Clasificación.",
      url: "https://i.postimg.cc/pr4YtLtw/unnamed-(8).png",
      tag: "Proyecto"
    },
    {
      title: "Mindmap: Estructura del Curso",
      desc: "Mapa mental completo de conceptos, herramientas y evaluaciones de HID-608.",
      url: "https://i.postimg.cc/mDdy8Spr/unnamed-(9).png",
      tag: "Resumen"
    }
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = direction === 'left' ? -current.offsetWidth / 1.5 : current.offsetWidth / 1.5;
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group px-4">
        <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-earth-dark/80 hover:bg-earth-dark text-white p-3 rounded-full shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:scale-110 active:scale-95"
            aria-label="Anterior"
        >
            <ChevronLeft size={24} />
        </button>
        
        <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 py-8 px-4 snap-x snap-mandatory scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none' 
            }}
        >
            {infographics.map((info, idx) => (
                <div 
                    key={idx} 
                    onClick={() => onImageClick(info.url, info.title)}
                    className="min-w-[85vw] md:min-w-[400px] flex-shrink-0 snap-center group/card relative overflow-hidden rounded-2xl shadow-lg border border-white/10 cursor-pointer h-[500px] bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                    <img src={info.url} alt={info.title} className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-earth-blue/90 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm border border-white/10">
                        {info.tag}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                        <h4 className="text-2xl font-bold text-white mb-3 font-serif leading-tight">{info.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                        {info.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-earth-dark/80 hover:bg-earth-dark text-white p-3 rounded-full shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Siguiente"
        >
            <ChevronRight size={24} />
        </button>
        
        {/* Scroll Indicators/Hint */}
        <div className="flex justify-center mt-4 gap-2 md:hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-earth-blue"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>
    </div>
  );
};

const FieldGallery = ({ onImageClick }: { onImageClick: (url: string, title: string) => void }) => {
  const photos = [
    {
      title: "Infografía de Proceso",
      subtitle: "Foto 1: 18°54´48.32”N 98°06´31.27”O",
      date: "Abril 2022",
      url: "https://i.postimg.cc/FHq2Nghk/unnamed-(4).png"
    },
    {
      title: "Vista Panorámica Valsequillo",
      subtitle: "Foto 2: 18°55´01.80”N 98°08´02.55”O",
      date: "Noviembre 2015",
      url: "https://images.unsplash.com/photo-1572359351259-15a457062337?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Cultivos Módulo 1",
      subtitle: "Parcela 17303: 18°46´53.11”N 97°54´40.23”O",
      date: "Octubre 2012",
      url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Camino Rural Módulo 2",
      subtitle: "Foto 4: 18°52´34.36”N 97°49´15.71”O",
      date: "Agosto 2012",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group px-4">
      {/* Controls */}
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-earth-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:scale-110 active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={() => scroll('right')} 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-earth-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <ChevronRight size={24} />
      </button>

      {/* Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 py-4 px-2 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((photo, idx) => (
          <div 
            key={idx} 
            onClick={() => onImageClick(photo.url, photo.title || 'Galería')}
            className="min-w-[280px] md:min-w-[320px] flex-shrink-0 bg-white p-3 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all cursor-pointer group/card hover:-translate-y-1 snap-center"
          >
            <div className="h-48 overflow-hidden rounded-lg mb-3 relative">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                <Camera size={10} /> {photo.date}
              </div>
            </div>
            <h4 className="text-sm font-bold text-earth-dark mb-1 line-clamp-1">{photo.title}</h4>
            <p className="text-[10px] text-gray-500 font-mono line-clamp-2">{photo.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const VideoGallery = () => {
  // Placeholder data for videos - User can replace with real YouTube IDs
  const videos = [
    { 
      id: "yeGWk2_0pb0",
      title: "Fundamentos de Teledetección", 
      url: "https://www.youtube.com/watch?v=yeGWk2_0pb0" 
    },
    { 
      id: "_vvDMJuEmB0",
      title: "Descarga de Imágenes (GloVis/EarthExplorer)", 
      url: "https://youtu.be/_vvDMJuEmB0" 
    },
    { 
      id: "6h3dngyDc14",
      title: "Corrección Atmosférica en QGIS", 
      url: "https://www.youtube.com/watch?v=6h3dngyDc14" 
    },
    { 
      id: "2LZml5Sgk6E", 
      title: "Clasificación Supervisada con SCP", 
      url: "https://www.youtube.com/watch?v=2LZml5Sgk6E" 
    }
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {videos.map((video, i) => (
        <a 
          key={i} 
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col h-full hover:-translate-y-1"
        >
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
            <img 
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
              alt={video.title} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300 shadow-lg">
                <Play size={20} className="text-white fill-current ml-1" />
              </div>
            </div>
          </div>
          <div className="p-4 flex-1">
            <h4 className="font-bold text-earth-dark text-sm group-hover:text-earth-blue transition-colors line-clamp-2">{video.title}</h4>
            <p className="text-xs text-gray-500 mt-1">Video Tutorial</p>
          </div>
        </a>
      ))}
    </div>
  );
};

const CreatorProfile = () => {
  return (
    <section id="creator" className="py-24 bg-white border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
          {/* Profile Image & Basic Info */}
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full bg-earth-blue text-white flex items-center justify-center text-6xl font-serif font-bold shadow-xl mb-6 border-4 border-earth-light">
              CA
            </div>
            <h2 className="font-serif text-2xl text-earth-dark font-bold mb-2">Carlos Armando Corona Solano</h2>
            <p className="text-earth-blue font-medium mb-4">Ingeniero en Recursos Naturales Renovables</p>

            <div className="flex flex-col gap-2 text-sm text-gray-600 w-full max-w-xs">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Mail size={16} className="text-earth-green" /> carlos06_1997@hotmail.com
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Phone size={16} className="text-earth-green" /> 311-144-0570
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Formación Académica */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-serif text-lg text-earth-dark font-bold mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-earth-blue" /> Formación Académica
              </h3>
              <ul className="space-y-4">
                <li className="relative pl-4 border-l-2 border-earth-blue/30">
                  <span className="text-xs font-bold text-earth-blue block">2018 - 2022</span>
                  <p className="text-sm font-medium text-gray-800">Ingeniería en Recursos Naturales Renovables</p>
                  <p className="text-xs text-gray-500">Universidad Autónoma Chapingo - Depto. Suelos</p>
                </li>
                <li className="relative pl-4 border-l-2 border-earth-blue/30">
                  <span className="text-xs font-bold text-earth-blue block">2015 - 2018</span>
                  <p className="text-sm font-medium text-gray-800">Preparatoria Agrícola</p>
                  <p className="text-xs text-gray-500">Universidad Autónoma Chapingo (UACh)</p>
                </li>
              </ul>
            </div>

            {/* Experiencia Profesional */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-serif text-lg text-earth-dark font-bold mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-earth-blue" /> Experiencia Profesional
              </h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>
                  <strong>2022:</strong> Asesor Técnico Nivel B - Subdirección de Recursos Humanos, UACh.
                </li>
                <li>
                  <strong>2022:</strong> Servicio Social - Fundación Universidad Autónoma Chapingo A.C (Prevención de incendios forestales).
                </li>
                <li>
                  <strong>2015-2018:</strong> Prácticas en la Comisión Nacional de Zonas Áridas (CONAZA), Nayarit.
                </li>
              </ul>
            </div>

            {/* Habilidades Informáticas */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-serif text-lg text-earth-dark font-bold mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-earth-blue" /> Habilidades Técnicas
              </h3>
              <div className="flex flex-wrap gap-2">
                {["QGIS", "ArcMap", "R-Studio", "SAS", "Office 365", "Google Earth", "Adobe Lightroom", "Vegas Pro"].map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Cursos y Logros */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-serif text-lg text-earth-dark font-bold mb-4 flex items-center gap-2">
                <Award size={20} className="text-earth-blue" /> Cursos y Diplomados
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Evaluación de Políticas Públicas (SHCP, 2022)</li>
                <li>• Diplomado en Educación Financiera (CONDUSEF)</li>
                <li>• Educación Ambiental para Cambio Climático (INECC)</li>
                <li>• Introducción a la Geo inteligencia Computacional (Centro Geo)</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const ImageModal = ({ url, title, onClose }: { url: string; title: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white hover:text-earth-accent p-2 transition-all active:scale-90"
      >
        <X size={40} strokeWidth={1.5} />
      </button>
      <div className="max-w-6xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img 
          src={url} 
          alt={title} 
          className="max-h-[85vh] w-auto rounded-lg shadow-2xl animate-scale-in border-4 border-white/10" 
        />
        {title && <h3 className="text-white font-serif text-2xl mt-6 tracking-wide drop-shadow-lg">{title}</h3>}
      </div>
    </div>
  );
};

interface PracticeCardProps {
  number: string;
  title: string;
  content: string;
  color: string;
  image?: string;
  onClick: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ number, title, content, color, image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col group hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 h-full cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-transparent hover:border-earth-blue/20"
    >
      <div className="h-40 w-full overflow-hidden relative">
        {image ? (
          <div className="w-full h-full">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className={`absolute inset-0 bg-${color.replace('bg-', '')}/20 mix-blend-multiply`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ) : (
          <div className={`w-full h-full ${color}`}></div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-earth-dark shadow-sm">
          PRÁCTICA {number}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h3 className="font-serif text-xl text-earth-dark mb-3 group-hover:text-earth-blue transition-colors font-bold">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{content}</p>
        <div className="flex items-center text-earth-blue text-sm font-bold mt-auto group-hover:translate-x-2 transition-transform">
          Ver detalles <span className="ml-1">→</span>
        </div>
      </div>
    </div>
  );
};

// --- PracticeModal Component (Definition preserved) ---
const PracticeModal = ({ practice, onClose }: { practice: PracticeDetail | null, onClose: () => void }) => {
  if (!practice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-earth-dark z-10 bg-white/80 backdrop-blur-sm active:scale-90 duration-200"
        >
          <X size={24} />
        </button>

        <div className="mb-8 pb-6 border-b border-gray-100">
          <span className="text-xs font-bold text-earth-blue uppercase tracking-widest mb-2 block">Detalle de Práctica {practice.id}</span>
          <h2 className="font-serif text-3xl md:text-4xl text-earth-dark mb-4">{practice.title}</h2>

          {practice.image && (
            <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 shadow-md relative group">
              <img
                src={practice.image}
                alt={practice.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
            </div>
          )}

          <p className="text-gray-600 text-lg leading-relaxed">{practice.description}</p>
        </div>

        <div className="space-y-12">
          {practice.steps.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-6 group border-b border-gray-100 pb-8 last:border-0">
              <div className="flex-shrink-0 mt-1 md:w-8">
                <div className="w-8 h-8 rounded-full bg-earth-green/10 text-earth-green flex items-center justify-center font-bold text-sm group-hover:bg-earth-green group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
              </div>
              <div className="w-full">
                <h4 className="font-bold text-earth-dark text-lg mb-3">{step.title}</h4>
                <p className="text-gray-600 text-base leading-relaxed mb-4 whitespace-pre-line">{step.content}</p>

                {step.image && (
                  <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border border-gray-200 mb-4">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                {step.code && (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative group/code mt-4 border border-gray-800">
                    <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-white active:scale-90 transition-transform" title="Copiar código">
                        <Copy size={16} />
                      </button>
                    </div>
                    <pre className="text-green-400 font-mono text-xs md:text-sm leading-relaxed">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-earth-dark text-white rounded-lg hover:bg-earth-blue active:scale-95 transition-all duration-200 font-medium text-sm shadow-lg shadow-earth-dark/20 hover:shadow-earth-blue/30">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

const ScriptRepository = () => {
  const [selectedScript, setSelectedScript] = useState<string>("WB.py");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-blue/20 overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="p-6 bg-earth-light border-b border-earth-blue/10">
        <h3 className="font-serif text-xl text-earth-dark flex items-center gap-2">
          <Code size={20} className="text-earth-blue" /> Repositorio de Scripts
        </h3>
        <p className="text-sm text-gray-500">Códigos Python utilizados en el manual</p>
      </div>
      <div className="flex flex-col md:flex-row h-full min-h-[400px]">
        <div className="w-full md:w-1/3 border-r border-gray-100 bg-gray-50 overflow-y-auto">
          {Object.keys(pythonScripts).map((scriptName) => (
            <button
              key={scriptName}
              onClick={() => setSelectedScript(scriptName)}
              className={`w-full text-left px-4 py-3 text-sm font-mono border-b border-gray-100 hover:bg-white transition-colors active:bg-gray-100 ${selectedScript === scriptName ? 'bg-white border-l-4 border-l-earth-blue font-bold text-earth-blue shadow-sm' : 'text-gray-600'}`}
            >
              {scriptName}
            </button>
          ))}
        </div>
        <div className="w-full md:w-2/3 bg-gray-900 p-4 overflow-auto">
          <pre className="text-green-400 font-mono text-xs md:text-sm leading-relaxed">
            <code>{pythonScripts[selectedScript as keyof typeof pythonScripts]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{url: string, title: string} | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handlePracticeClick = (id: string) => {
    setSelectedPracticeId(id);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-gray-800 selection:bg-earth-blue selection:text-white">

      <PracticeModal
        practice={selectedPracticeId ? practiceData[selectedPracticeId] : null}
        onClose={() => setSelectedPracticeId(null)}
      />

      {selectedGalleryImage && (
        <ImageModal 
          url={selectedGalleryImage.url} 
          title={selectedGalleryImage.title} 
          onClose={() => setSelectedGalleryImage(null)} 
        />
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-earth-blue rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-earth-dark transition-colors duration-300">
              <Globe size={20} className="group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif font-bold text-lg leading-none ${scrolled ? 'text-earth-dark' : 'text-white md:text-earth-dark'} `}>
                HID-608
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${scrolled ? 'text-gray-500' : 'text-gray-300 md:text-gray-500'}`}>Sensores Remotos</span>
            </div>
          </div>

          <div className={`hidden md:flex items-center gap-6 text-sm font-medium tracking-wide ${scrolled ? 'text-gray-600' : 'text-gray-200'}`}>
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Introducción</a>
            <a href="#software" onClick={scrollToSection('software')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Software</a>
            <a href="#practices" onClick={scrollToSection('practices')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Prácticas</a>
            <a href="#procedures" onClick={scrollToSection('procedures')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Procedimientos</a>
            <a href="#tools" onClick={scrollToSection('tools')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Simuladores</a>
            <a href="#gallery" onClick={scrollToSection('gallery')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Galería</a>
            <a href="#creator" onClick={scrollToSection('creator')} className="hover:text-earth-blue hover:-translate-y-0.5 transition-all uppercase">Autor</a>
            <a
              href="#"
              className="px-5 py-2 bg-earth-blue text-white rounded-full hover:bg-earth-dark active:scale-95 transition-all shadow-sm hover:shadow-earth-blue/30 flex items-center gap-2"
            >
              <Download size={16} /> Manual PDF
            </a>
          </div>

          <button className={`md:hidden p-2 ${scrolled ? 'text-earth-dark' : 'text-white'}`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
          <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-earth-blue transition-colors uppercase">Introducción</a>
          <a href="#software" onClick={scrollToSection('software')} className="hover:text-earth-blue transition-colors uppercase">Software</a>
          <a href="#practices" onClick={scrollToSection('practices')} className="hover:text-earth-blue transition-colors uppercase">Prácticas</a>
          <a href="#procedures" onClick={scrollToSection('procedures')} className="hover:text-earth-blue transition-colors uppercase">Procedimientos</a>
          <a href="#tools" onClick={scrollToSection('tools')} className="hover:text-earth-blue transition-colors uppercase">Simuladores</a>
          <a href="#gallery" onClick={scrollToSection('gallery')} className="hover:text-earth-blue transition-colors uppercase">Galería</a>
          <a href="#creator" onClick={scrollToSection('creator')} className="hover:text-earth-blue transition-colors uppercase">Autor</a>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-earth-dark text-white">
        <HeroScene />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F0F4F8]"></div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-4 py-1 border border-earth-accent/50 text-earth-accent text-xs tracking-[0.3em] uppercase font-bold rounded-full backdrop-blur-sm bg-black/20 hover:bg-black/40 transition-colors cursor-default">
            Colegio de Postgraduados • {CURRENT_YEAR}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-6 drop-shadow-lg">
            Introducción al uso de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-earth-green to-earth-blue">Sensores Remotos</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-10">
            Manual interactivo del curso HID-608. Recursos, scripts y tutoriales paso a paso sobre procesamiento de imágenes satelitales.
          </p>

          <div className="flex justify-center">
            <a href="#intro" onClick={scrollToSection('intro')} className="animate-bounce p-3 bg-white/10 backdrop-blur rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
              <ArrowDown size={24} />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Introduction & Concepts */}
        <section id="intro" className="py-24 bg-white">
          <div className="container mx-auto px-6">

            <IntroductionCard />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <h2 className="font-serif text-4xl mb-6 text-earth-dark">Conceptos Fundamentales</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  El curso HID-608 aborda los fundamentos y la práctica del uso de imágenes satelitales para el análisis territorial.
                </p>
                <div className="bg-earth-light rounded-xl border border-earth-blue/10 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-earth-blue/5 p-4 border-b border-earth-blue/10">
                    <h4 className="font-bold text-earth-blue flex items-center gap-2"><Layers size={18} /> Glosario Clave</h4>
                  </div>
                  <ul className="text-sm text-gray-600 divide-y divide-earth-blue/5">
                    <li className="p-4 hover:bg-white transition-colors"><strong>Información Vectorial:</strong> Representación mediante geometrías (puntos, líneas, polígonos). Archivos .SHP.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>Información Ráster:</strong> Matriz de píxeles donde cada celda tiene un valor. Archivos .TIF.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>NDVI:</strong> Índice de Vegetación de Diferencia Normalizada. Indica salud vegetal.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>Working Box (WB):</strong> Área de trabajo definida por coordenadas extremas más un margen.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>Pansharpening:</strong> Fusión de bandas multiespectrales con pancromática para mejorar resolución.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>Clasificación Supervisada:</strong> Algoritmo entrenado con muestras conocidas (ROI) para categorizar pixeles.</li>
                    <li className="p-4 hover:bg-white transition-colors"><strong>Modelo Digital de Elevación (MDE):</strong> Representación raster de la topografía (GEMA/LIDAR).</li>
                  </ul>
                </div>
              </div>
              <div className="lg:col-span-7">
                <WorkflowDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* Software & Links Setup */}
        <section id="software" className="py-20 bg-earth-dark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-earth-blue/10 skew-x-12"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl mb-4">Software y Datos</h2>
              <p className="text-gray-400">Herramientas oficiales requeridas para el curso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {softwareLinks.map((sw, idx) => (
                <a
                  key={idx}
                  href={sw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white text-earth-dark rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-black/20 group-hover:rotate-12 transition-transform duration-300">
                    {sw.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{sw.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{sw.desc}</p>
                  <div className="mt-auto text-earth-accent text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    Descargar <ExternalLink size={10} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Practices Grid */}
        <section id="practices" className="py-24 bg-[#F0F4F8]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-4xl text-earth-dark mb-2">Prácticas del Curso</h2>
                <div className="h-1 w-20 bg-earth-accent rounded-full"></div>
              </div>
              <p className="text-gray-600 max-w-md text-right mt-4 md:mt-0">
                Ejercicios prácticos paso a paso para el dominio del procesamiento de imágenes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.values(practiceData).map((practice) => (
                <PracticeCard
                  key={practice.id}
                  number={practice.id}
                  title={practice.title}
                  content={practice.description}
                  image={practice.image}
                  color={`bg-${['gray-400', 'earth-blue', 'earth-green', 'earth-accent', 'purple-500', 'red-500', 'orange-500', 'teal-500', 'indigo-500'][parseInt(practice.id) - 1]}`}
                  onClick={() => handlePracticeClick(practice.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Procedures Section */}
        <section id="procedures" className="py-24 bg-white border-y border-gray-200">
          <div className="container mx-auto px-6">
            <h2 className="font-serif text-4xl text-earth-dark mb-12 text-center">Procedimientos Comunes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {proceduresData.map((proc, idx) => (
                <div key={idx} className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden hover:border-earth-blue/30 hover:shadow-md transition-all cursor-default group hover:-translate-y-1 flex flex-col h-full">
                  {/* Image Area */}
                  {proc.image && (
                    <div className="h-32 w-full overflow-hidden relative">
                      <img src={proc.image} alt={proc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:bg-transparent transition-colors" />
                    </div>
                  )}
                  {/* Content Area */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-earth-blue/10 text-earth-blue rounded-lg group-hover:bg-earth-blue group-hover:text-white transition-colors duration-300">
                        <Cpu size={16} />
                      </div>
                      <h4 className="font-bold text-earth-dark text-sm leading-tight">{proc.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{proc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Tools */}
        <section id="tools" className="py-24 bg-[#F0F4F8]">
          <div className="container mx-auto px-6">
            <h2 className="font-serif text-4xl text-center text-earth-dark mb-4">Simuladores Interactivos</h2>
            <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">Herramientas para visualizar conceptos físicos y matemáticos de la teledetección.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1">
                <NDVICalculator />
              </div>
              <div className="lg:col-span-2">
                <SpectralSignaturePlot />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <ReflectanceCalculator />
              </div>
              <div className="lg:col-span-1">
                <ResolutionComparator />
              </div>
              <div className="lg:col-span-1">
                <BandCombinator />
              </div>
              <div className="lg:col-span-1">
                <HillshadeSimulator />
              </div>
            </div>
            <div className="mt-8">
              <CommandReference />
            </div>
          </div>
        </section>

        {/* Script Repository */}
        <section id="scripts" className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-earth-dark mb-2">Repositorio de Scripts Python</h2>
              <p className="text-gray-600">Automatización de procesos en QGIS.</p>
            </div>
            <ScriptRepository />
          </div>
        </section>

        {/* Visual Guides and Infographics (CAROUSEL) */}
        <section className="py-24 bg-earth-dark overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl text-white mb-4">Guías Visuales e Infografías</h3>
              <p className="text-gray-400">Diagramas técnicos detallando el flujo de trabajo en QGIS.</p>
            </div>
            <InfographicGallery onImageClick={(url, title) => setSelectedGalleryImage({url, title})} />
          </div>
        </section>

        {/* Gallery Field Section (NEW) */}
        <section id="gallery" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl text-earth-dark mb-4 flex items-center justify-center gap-2">
                <ImageIcon size={28} className="text-earth-blue" /> Anexos: Memoria Fotográfica
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Registro visual de las parcelas del Distrito de Riego 030 y la Presa Manuel Ávila Camacho.
              </p>
            </div>
            <FieldGallery onImageClick={(url, title) => setSelectedGalleryImage({url, title})} />
          </div>
        </section>


        {/* Video Tutorials Section */}
        <section id="videos" className="py-24 bg-[#F0F4F8]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl text-earth-dark mb-4">Recursos Audiovisuales</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">Video tutoriales complementarios para reforzar el aprendizaje práctico en software.</p>
            </div>
            <VideoGallery />
          </div>
        </section>

        {/* Creator Profile Section */}
        <CreatorProfile />

      </main>

      <footer className="bg-black text-gray-500 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-white font-serif font-bold text-2xl mb-2">HID-608</div>
            <p className="text-sm">Postgrado en Hidrociencias - Campus Montecillo</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-earth-green uppercase tracking-wider mb-1">Elaborado por</p>
            <p className="text-white font-medium">{AUTHOR_NAME}</p>
            <p className="text-xs mt-1">Año {CURRENT_YEAR}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

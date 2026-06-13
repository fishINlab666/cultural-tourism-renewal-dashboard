const RADAR_AXES = [
  { name: '区位潜力', source: '区位与导流潜力' },
  { name: '文化适配', source: '文化适配度' },
  { name: '改造难度', source: '工程可实施性', transform: (value) => 100 - value },
  { name: '商业承载', source: '商业承载力' },
  { name: '夜间潜力', source: '夜间运营潜力' },
  { name: '投资谨慎', source: '投资谨慎指数' },
];

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export function buildRadarData(diagnostics = []) {
  const valuesByLabel = new Map(diagnostics.map((item) => [item.label, clampScore(item.value)]));
  return RADAR_AXES.map((axis) => {
    const value = valuesByLabel.get(axis.source) ?? 0;
    return { name: axis.name, value: clampScore(axis.transform ? axis.transform(value) : value) };
  });
}

export function canUseMapbox(config = {}, mapboxLibrary = {}) {
  return Boolean(String(config.mapboxAccessToken ?? '').trim() && typeof mapboxLibrary.Map === 'function');
}

export function getMotionSettings(reducedMotion) {
  return reducedMotion
    ? { scoreDuration: 0, mapDuration: 0 }
    : { scoreDuration: 780, mapDuration: 1400 };
}

export function createDiagnosticLifecycle() {
  const claimed = new Set();
  return {
    claim(key) {
      if (claimed.has(key)) return false;
      claimed.add(key);
      return true;
    },
    snapshot() {
      return Object.fromEntries(['score', 'radar', 'map'].map((key) => [key, claimed.has(key)]));
    },
  };
}

function setFallbackMap(elements, message) {
  elements.projectMap?.classList.add('is-fallback');
  if (elements.mapModeChip) elements.mapModeChip.textContent = message;
}

function renderFallbackValues(elements, radarData) {
  const container = elements.radarFallbackValues;
  if (!container) return;
  container.replaceChildren(...radarData.map((item) => {
    const value = container.ownerDocument.createElement('span');
    value.textContent = `${item.name} ${item.value}`;
    return value;
  }));
  container.classList.add('is-visible');
}

function renderConclusions(elements, conclusions) {
  const container = elements.diagnosticConclusions;
  if (!container) return;
  container.replaceChildren(...conclusions.map((item) => {
    const row = container.ownerDocument.createElement('article');
    row.className = `conclusion-item is-${item.level}`;
    const label = container.ownerDocument.createElement('strong');
    label.textContent = item.label;
    const text = container.ownerDocument.createElement('span');
    text.textContent = item.text;
    row.append(label, text);
    return row;
  }));
}

function radarOption(radarData, reducedMotion) {
  return {
    animationDuration: reducedMotion ? 0 : 520,
    tooltip: { trigger: 'item' },
    radar: {
      center: ['50%', '53%'],
      radius: '66%',
      splitNumber: 4,
      indicator: radarData.map((item) => ({ name: item.name, max: 100 })),
      axisName: { color: '#5f7067', fontSize: 11 },
      axisLine: { lineStyle: { color: '#d5ded9' } },
      splitLine: { lineStyle: { color: '#d5ded9' } },
      splitArea: { areaStyle: { color: ['#fbfcfb', '#f5f8f6'] } },
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: '#1f6048', width: 2 },
      itemStyle: { color: '#1f6048' },
      areaStyle: { color: 'rgba(31, 96, 72, 0.24)' },
      data: [{ name: '空间诊断', value: radarData.map((item) => item.value) }],
    }],
  };
}

export function createDiagnosticView(windowObject = window) {
  const lifecycle = createDiagnosticLifecycle();
  const reducedMotion = windowObject.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = getMotionSettings(reducedMotion);
  let radarChart = null;
  let map = null;

  function animateScore(element, target) {
    if (!element) return;
    element.setAttribute('aria-label', `综合评分 ${target} 分`);
    if (!lifecycle.claim('score') || motion.scoreDuration === 0) {
      element.textContent = String(target);
      return;
    }
    const startedAt = windowObject.performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / motion.scoreDuration);
      const eased = 1 - ((1 - progress) ** 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) windowObject.requestAnimationFrame(tick);
    };
    element.textContent = '0';
    windowObject.requestAnimationFrame(tick);
  }

  function renderRadar(elements, diagnostics) {
    const radarData = buildRadarData(diagnostics);
    const echartsLibrary = windowObject.echarts;
    if (!echartsLibrary?.init || !elements.diagnosticRadar) {
      renderFallbackValues(elements, radarData);
      return;
    }
    try {
      if (!radarChart) {
        radarChart = echartsLibrary.init(elements.diagnosticRadar, null, { renderer: 'canvas' });
        lifecycle.claim('radar');
      }
      radarChart.setOption(radarOption(radarData, reducedMotion), true);
      radarChart.resize();
      elements.radarFallbackValues?.classList.remove('is-visible');
    } catch {
      renderFallbackValues(elements, radarData);
    }
  }

  function initializeMap(elements, overview) {
    const config = windowObject.APP_CONFIG ?? {};
    const mapboxLibrary = windowObject.mapboxgl ?? {};
    if (!canUseMapbox(config, mapboxLibrary)) {
      setFallbackMap(elements, '演示定位 · 配置 Mapbox 后显示实时底图');
      return;
    }
    if (map) {
      map.resize();
      return;
    }
    if (!lifecycle.claim('map')) return;

    try {
      mapboxLibrary.accessToken = config.mapboxAccessToken;
      const center = overview.map.center;
      map = new mapboxLibrary.Map({
        container: elements.mapboxCanvas,
        style: 'mapbox://styles/mapbox/light-v11',
        center: reducedMotion ? center : [119.235, 26.085],
        zoom: reducedMotion ? 15.2 : 10.4,
        pitch: 0,
        bearing: 0,
        attributionControl: true,
      });
      map.addControl(new mapboxLibrary.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', () => {
        elements.projectMap?.classList.remove('is-fallback');
        if (elements.mapModeChip) elements.mapModeChip.textContent = 'Mapbox 浅色底图 · 三坊七巷';
        const markerElement = elements.mapboxCanvas.ownerDocument.createElement('span');
        markerElement.className = 'live-map-marker';
        new mapboxLibrary.Marker({ element: markerElement }).setLngLat(center).addTo(map);
        new mapboxLibrary.Popup({ offset: 22, closeButton: false, closeOnClick: false })
          .setLngLat(center)
          .setText(overview.map.label)
          .addTo(map);
        if (!reducedMotion) map.flyTo({ center, zoom: 15.2, duration: motion.mapDuration, essential: true });
      });
      map.on('error', () => setFallbackMap(elements, '实时底图暂不可用 · 已切换演示定位'));
    } catch {
      map = null;
      setFallbackMap(elements, '实时底图暂不可用 · 已切换演示定位');
    }
  }

  return {
    render({ overview, diagnostics, elements }) {
      if (!overview) return;
      animateScore(elements.overallScore, overview.score);
      if (elements.mapPlaceName) elements.mapPlaceName.textContent = overview.map.place;
      renderConclusions(elements, overview.conclusions);
      renderRadar(elements, diagnostics);
      initializeMap(elements, overview);
    },
    resize() {
      radarChart?.resize();
      map?.resize();
    },
  };
}

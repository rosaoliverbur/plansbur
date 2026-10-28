import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BURRIANA_CENTER, CATEGORY_MAP } from '../lib/constants';
import type { Plan } from '../lib/types';
import { cn } from '../lib/utils';
import { Crosshair, MapPin, Compass } from 'lucide-react';

export interface MapRoute {
  coords: [number, number][];
  origin: [number, number];
}

interface Props {
  plans?: Plan[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  route?: MapRoute | null;
  pick?: { value: [number, number] | null; onPick: (pos: [number, number]) => void };
  className?: string;
  zoom?: number;
}

function createPlanIcon(plan: Plan, selected: boolean) {
  const cls = cn(
    'bp-marker',
    selected && 'is-selected',
    plan.status === 'past' && 'is-past',
    plan.status === 'live' && 'is-live'
  );
  const count = plan.attendees?.length || 0;
  const cat = CATEGORY_MAP[plan.category];
  const emoji = cat?.emoji ?? '📍';
  const label = `${plan.title} en ${plan.place_name}`.replace(/"/g, '');

  return L.divIcon({
    className: '',
    html: `<div class="${cls}" data-testid="map-marker-${plan.id}" role="button" aria-label="${label}">
      <span class="bp-ring"></span>
      <span class="bp-dot">${emoji}</span>
      ${count > 0 ? `<span class="bp-count">${count}</span>` : ''}
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

const meIcon = L.divIcon({
  className: '',
  html: '<div class="bp-me" data-testid="map-origin-marker" title="Tu ubicación en Burriana"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const pickIcon = L.divIcon({
  className: '',
  html: '<div class="bp-pick" data-testid="map-pick-marker"></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function PlanMap({
  plans = [],
  selectedId,
  onSelect,
  route,
  pick,
  className,
  zoom = 14,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BURRIANA_CENTER,
        zoom: zoom,
        minZoom: 12,
        maxZoom: 19,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        className: 'bp-tiles',
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Click to pick location
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (pick?.onPick) {
          pick.onPick([e.latlng.lat, e.latlng.lng]);
        }
      });
    }

    const ro = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    ro.observe(mapContainerRef.current);

    return () => {
      ro.disconnect();
    };
  }, []);

  // Update pick listener if pick changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.off('click');
    if (pick?.onPick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        pick.onPick([e.latlng.lat, e.latlng.lng]);
      });
    }
  }, [pick?.onPick]);

  // Update Pick marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pick?.value) {
      if (!pickMarkerRef.current) {
        pickMarkerRef.current = L.marker(pick.value, { icon: pickIcon }).addTo(map);
      } else {
        pickMarkerRef.current.setLatLng(pick.value);
      }
    } else {
      if (pickMarkerRef.current) {
        pickMarkerRef.current.remove();
        pickMarkerRef.current = null;
      }
    }
  }, [pick?.value]);

  // Update plan markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    plans.forEach((plan) => {
      const isSelected = plan.id === selectedId;
      const marker = L.marker([plan.lat, plan.lng], {
        icon: createPlanIcon(plan, isSelected),
        zIndexOffset: isSelected ? 1000 : plan.status === 'past' ? -100 : 10,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelect?.(plan.id);
      });

      marker.addTo(layer);
    });
  }, [plans, selectedId, onSelect]);

  // Fly to selected plan
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const selected = plans.find((p) => p.id === selectedId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [selectedId, plans]);

  // Route updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const rLayer = routeLayerRef.current;
    if (!map || !rLayer) return;

    rLayer.clearLayers();

    if (route && route.coords.length > 0) {
      const poly = L.polyline(route.coords, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        dashArray: '8, 8',
      });
      poly.addTo(rLayer);

      const me = L.marker(route.origin, { icon: meIcon });
      me.addTo(rLayer);

      if (route.coords.length > 1) {
        map.fitBounds(L.latLngBounds(route.coords), { padding: [50, 50] });
      }
    }
  }, [route]);

  // Reset to Burriana center
  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo(BURRIANA_CENTER, 14, { duration: 0.5 });
  };

  return (
    <div className={cn('relative isolate w-full h-full overflow-hidden bg-slate-900', className)} data-testid="burriana-map">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating map quick presets for Burriana */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
          title="Centrar mapa en Burriana"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Burriana Centro</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8732, -0.0610], 15, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>🏖️ El Arenal</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8785, -0.0712], 15, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>🌿 El Clot</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8655, -0.0645], 15, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>⚓ El Port</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8665, -0.0630], 16, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>🍦 Hand's (Hans)</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8872, -0.0798], 16, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>🍨 Don Pipo</span>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([39.8857, -0.0759], 15, { duration: 0.5 })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/85 backdrop-blur-md text-yellow-300 border border-yellow-500/40 shadow-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <span>🍟 BK & McDo</span>
        </button>
      </div>

      {pick?.onPick && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-full shadow-xl flex items-center gap-2 border border-amber-400 animate-bounce">
          <MapPin className="w-4 h-4" />
          <span>Toca el mapa en el lugar exacto del plan en Burriana</span>
        </div>
      )}
    </div>
  );
}

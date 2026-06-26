import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { getPoints } from "../services/mapService";
import { useAuth } from "../contexts/AuthContext";

const containerStyle = { width: "100%", height: "100%" };

const mapStyles = [
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f2efe9" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8f4e8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fde8c8" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#f5c98a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b8d9f0" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6aa8d0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8e6c9" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8f5e9" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#ede7f6" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#192853" }] },
  { featureType: "administrative", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7a99" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] },
];

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="#192853"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#192853" opacity="0.5"/>
  </svg>
);

export const Map = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -28.2624, lng: -52.4088 });
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [extras, setExtras] = useState({});
  const markerClickedRef = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    const stored = JSON.parse(localStorage.getItem("evenza_eventos") || "{}");
    setExtras(stored);
  }, []);

  useEffect(() => {
    async function fetchMarkers() {
      try {
        const data = await getPoints(token);
        const stored = JSON.parse(localStorage.getItem("evenza_eventos") || "{}");
        const normalize = (s) => s?.trim().toLowerCase();
        const filtered = data.filter((m) =>
          Object.values(stored).some((ex) => normalize(ex.titulo) === normalize(m.title))
        );
        setMarkers(filtered);
      } catch (e) {
        console.log(e.message);
      }
    }
    fetchMarkers();
  }, [token]);

  const customMarkerIcon = isLoaded ? {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#192853",
    fillOpacity: 1,
    strokeColor: "#ffe14e",
    strokeWeight: 2,
    scale: 1.8,
    anchor: new window.google.maps.Point(12, 22),
  } : null;

  const handleMapClick = () => {
    if (markerClickedRef.current) {
      markerClickedRef.current = false;
      return;
    }
    setSelectedMarker(null);
  };

  // Eventos do localStorage como fallback para busca
  const localEventos = Object.values(extras);

  // Filtra markers pelo texto de busca; se não há markers ainda, busca no localStorage
  const filteredMarkers = markers.length > 0
    ? markers.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    : localEventos
        .filter((ex) => ex.titulo?.toLowerCase().includes(search.toLowerCase()))
        .map((ex, i) => ({ id: `local-${i}`, title: ex.titulo, position: null }));

  // Últimos 10: prefere markers da API, cai para localStorage
  const last10 = markers.length > 0
    ? markers.slice(-10).reverse()
    : localEventos.slice(-10).reverse().map((ex, i) => ({ id: `local-${i}`, title: ex.titulo, position: null }));

  // Carrossel: todos os markers com imagem salva, ou todos se não filtrado
  const carouselItems = markers.filter((m) => {
    const key = Object.keys(extras).find(
      (k) => extras[k].titulo === m.title
    );
    return !!key;
  });

  const getExtra = (marker) => {
    const key = Object.keys(extras).find((k) => extras[k].titulo === marker.title) ?? marker.id;
    return extras[key] || extras[marker.id] || null;
  };

  return (
    <div className="flex flex-col h-full bg-[#eff8ff] relative">

      {/* Topo: botão logout + barra de pesquisa */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
        {/* Linha superior: espaço + botão sair */}
        <div className="flex justify-end">
          <button
            onClick={logout}
            className="w-[40px] h-[40px] rounded-full bg-white border-2 border-[#ffe14e] shadow-md flex items-center justify-center hover:brightness-105 transition-colors"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Barra de pesquisa abaixo, largura total */}
        <div className="flex items-center bg-white/80 backdrop-blur-sm border-2 border-[#ffe14e] rounded-full shadow-md h-[40px] px-3 gap-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Pesquisar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            className="flex-1 bg-transparent text-[#192853] text-[14px] outline-none placeholder:text-[#192853]/60 font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#192853]/50 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Carrossel de eventos cadastrados */}
      {carouselItems.length > 0 && !search && (
        <div className="absolute top-[126px] left-0 right-0 z-10 px-3">
          <div className="flex gap-[9px] overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {carouselItems.map((m) => {
              const ex = getExtra(m);
              return (
                <div
                  key={m.id}
                  onClick={() => { setSelectedMarker(m); setMapCenter(m.position); }}
                  className="w-[110px] h-[110px] rounded-[20px] shrink-0 overflow-hidden shadow-md relative cursor-pointer"
                >
                  {ex?.imagem ? (
                    <img src={ex.imagem} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#192853] flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold text-center px-2">{m.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold leading-tight">{m.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resultados da pesquisa */}
      {/* Dropdown de busca: ao focar mostra últimos 10, ao digitar filtra */}
      {(searchFocused || search) && (
        <div className="absolute top-[108px] left-4 right-4 z-20 bg-white rounded-2xl shadow-xl overflow-hidden">
          {(search ? filteredMarkers : last10).length > 0 ? (
            <>
              {!search && (
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest px-4 pt-3 pb-1">
                  Últimos eventos
                </p>
              )}
              {(search ? filteredMarkers : last10).map((m) => {
                const ex = getExtra(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => { if (m.position) { setSelectedMarker(m); setMapCenter(m.position); } setSearch(""); setSearchFocused(false); }}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                  >
                    {ex?.imagem ? (
                      <img src={ex.imagem} alt={m.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#192853] flex items-center justify-center shrink-0">
                        <span className="text-white text-[11px] font-bold">{m.title[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-[#192853] font-semibold text-[14px]">{m.title}</p>
                      {ex?.localizacao && <p className="text-gray-400 text-[12px]">{ex.localizacao}</p>}
                      {ex?.data && <p className="text-gray-300 text-[11px]">{ex.data}</p>}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center px-4 py-3">Nenhum evento encontrado</p>
          )}
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 w-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14}
            onClick={handleMapClick}
            options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: false }}
          >
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                icon={customMarkerIcon}
                onClick={() => { markerClickedRef.current = true; setSelectedMarker(marker); }}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -36), disableAutoPan: false, disableCloseButton: true }}
              >
                <div style={{ maxWidth: 190, padding: "4px 2px" }}>
                  <p style={{ fontWeight: "700", color: "#192853", fontSize: 13, margin: "0 0 4px" }}>{selectedMarker.title}</p>
                  {getExtra(selectedMarker)?.descricao && (
                    <p style={{ color: "#555", fontSize: 11, margin: "0 0 3px" }}>{getExtra(selectedMarker).descricao}</p>
                  )}
                  {getExtra(selectedMarker)?.horario && (
                    <p style={{ color: "#888", fontSize: 11, margin: "2px 0 0" }}>🕐 {getExtra(selectedMarker).horario}</p>
                  )}
                  {getExtra(selectedMarker)?.localizacao && (
                    <p style={{ color: "#888", fontSize: 11, margin: "2px 0 0" }}>📍 {getExtra(selectedMarker).localizacao}</p>
                  )}
                  {getExtra(selectedMarker)?.inscricao === "Pago" && getExtra(selectedMarker)?.valor && (
                    <p style={{ color: "#192853", fontSize: 11, fontWeight: "600", margin: "4px 0 0" }}>💰 R$ {parseFloat(getExtra(selectedMarker).valor).toFixed(2)}</p>
                  )}
                  {getExtra(selectedMarker)?.inscricao && getExtra(selectedMarker).inscricao !== "Pago" && (
                    <p style={{ color: "#888", fontSize: 11, margin: "2px 0 0" }}>🎟 {getExtra(selectedMarker).inscricao}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center bg-[#eff8ff]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#192853] border-t-[#ffe14e] rounded-full animate-spin" />
              <p className="text-[#192853] font-semibold">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>


      <Navbar />
      <div className="h-[61px]" />
    </div>
  );
};

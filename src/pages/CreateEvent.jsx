import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { postPoint } from "../services/mapService";
import { Navbar } from "../components/Navbar";

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="#192853" opacity="0.5"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#192853" opacity="0.5"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#192853" opacity="0.5"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z" fill="#192853" opacity="0.5"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="#192853" opacity="0.4"/>
  </svg>
);
const UploadIcon = ({ color = "white" }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM12 11L8 15H11V19H13V15H16L12 11Z" fill={color}/>
  </svg>
);

const CATEGORIAS = ["Música", "Cultura", "Festa", "Entretenimento", "Congresso", "Seminário", "Esporte", "Show", "Feira", "Rodeio", "Inauguração", "Exposição", "Workshop", "Automóvel", "Festival", "Outros"];
const ACESSIBILIDADE = ["Físico", "Visual", "Auditivo", "Todas"];
const INSCRICOES = ["Pago", "Gratuito", "Sem Inscrição"];

function RowField({ icon, placeholder, type = "text", value, onChange, onBlur }) {
  return (
    <label className="flex items-center gap-3 py-[14px] border-b border-gray-100 last:border-0 cursor-pointer w-full">
      <span className="shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="flex-1 bg-transparent text-[#192853] text-[15px] outline-none placeholder:text-[#b0bec5] w-full font-medium"
      />
      <ChevronIcon />
    </label>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[13px] font-bold text-[#192853] uppercase tracking-widest mb-1">
      {children}
    </p>
  );
}

function Chips({ items, selected, onToggle, single }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => single
            ? onToggle(item === selected ? "" : item)
            : onToggle(item)
          }
          className={`px-4 py-[7px] rounded-full text-[13px] font-medium transition-all ${
            (single ? selected === item : selected.includes(item))
              ? "bg-[#192853] text-white"
              : "bg-[#e8edf5] text-[#192853]"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function CreateEvent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const imageInputRef = useRef(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geocodingStatus, setGeocodingStatus] = useState("");
  const [site, setSite] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [acessibilidade, setAcessibilidade] = useState([]);
  const [inscricao, setInscricao] = useState("");
  const [valor, setValor] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.lat && location.state?.lng) {
      setLat(String(location.state.lat.toFixed(6)));
      setLng(String(location.state.lng.toFixed(6)));
      if (location.state.endereco) setLocalizacao(location.state.endereco);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => {}
      );
    }
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagem(ev.target.result);
    reader.readAsDataURL(file);
  };

  const geocodeAddress = async (address) => {
    if (!address.trim()) return;
    setGeocodingStatus("buscando...");
    try {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
      );
      const json = await res.json();
      if (json.status === "OK" && json.results[0]) {
        const { lat: newLat, lng: newLng } = json.results[0].geometry.location;
        setLat(String(newLat.toFixed(6)));
        setLng(String(newLng.toFixed(6)));
        setGeocodingStatus("✓ Localização encontrada");
      } else {
        setGeocodingStatus("Endereço não encontrado");
      }
    } catch {
      setGeocodingStatus("Erro ao buscar endereço");
    }
  };

  const toggleChip = (list, setList, value) => {
    setList((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  };

  const handleSubmit = async () => {
    setErro("");
    if (!titulo.trim()) return setErro("Informe o título do evento.");
    if (categorias.length === 0) return setErro("Selecione ao menos uma categoria.");

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return setErro("Não foi possível obter a localização. Ative o GPS e tente novamente.");

    setLoading(true);
    try {
      const saved = await postPoint(token, { descricao: titulo, latitude, longitude });
      const extras = JSON.parse(localStorage.getItem("evenza_eventos") || "{}");
      extras[saved.id ?? titulo] = { titulo, descricao, data, horario, localizacao, site, categorias, acessibilidade, inscricao, valor: inscricao === "Pago" ? valor : "", imagem };
      localStorage.setItem("evenza_eventos", JSON.stringify(extras));
      navigate("/map");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff8ff] flex flex-col pb-[80px]">

      {/* Header */}
      <div className="flex items-center justify-center px-5 pt-10 pb-4">
        <p className="text-[#192853] font-bold text-[17px]">Cadastro de Eventos</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4">

        {/* Imagem */}
        <div
          onClick={() => imageInputRef.current?.click()}
          className="w-full h-[170px] rounded-[18px] overflow-hidden relative cursor-pointer bg-[#192853]/80"
        >
          {imagem ? (
            <img src={imagem} alt="capa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#ffe14e]/20 flex items-center justify-center">
                <UploadIcon color="#ffe14e" />
              </div>
              <p className="text-[#ffe14e] text-[13px] font-medium">Adicionar imagem do evento</p>
            </div>
          )}
          {imagem && (
            <div className="absolute inset-0 bg-black/20" />
          )}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        {/* Sobre o Evento */}
        <div className="bg-white rounded-[18px] px-4 pt-4 pb-3 flex flex-col gap-3 shadow-sm">
          <SectionLabel>Sobre o Evento</SectionLabel>

          <div>
            <p className="text-[13px] font-semibold text-[#192853] mb-1">Título <span className="text-red-500">*</span></p>
            <input
              type="text"
              placeholder="Ex: Festival de Verão 2026"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-[#dde6f0] rounded-[10px] px-3 h-[44px] text-[15px] text-[#192853] outline-none placeholder:text-[#b0bec5] focus:border-[#192853] bg-[#f7fafd]"
            />
          </div>

          <div>
            <p className="text-[13px] font-semibold text-[#192853] mb-1">Descrição</p>
            <textarea
              placeholder="Conte mais sobre o evento..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full border border-[#dde6f0] rounded-[10px] px-3 py-2 text-[15px] text-[#192853] outline-none placeholder:text-[#b0bec5] resize-none focus:border-[#192853] bg-[#f7fafd]"
            />
          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-white rounded-[18px] px-4 shadow-sm">
          <RowField icon={<CalendarIcon />} placeholder="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <RowField icon={<ClockIcon />} placeholder="Horário" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
          <RowField
            icon={<LocationIcon />}
            placeholder="Localização"
            value={localizacao}
            onChange={(e) => { setLocalizacao(e.target.value); setGeocodingStatus(""); }}
            onBlur={() => geocodeAddress(localizacao)}
          />
          <RowField icon={<LinkIcon />} placeholder="Site ou Rede Social" value={site} onChange={(e) => setSite(e.target.value)} />
        </div>
        {geocodingStatus && (
          <p className={`text-[12px] ml-2 -mt-2 ${geocodingStatus.startsWith("✓") ? "text-green-500" : "text-gray-400"}`}>
            {geocodingStatus}
          </p>
        )}

        {/* Categoria */}
        <div className="bg-white rounded-[18px] px-4 py-4 shadow-sm">
          <SectionLabel>Categoria <span className="text-red-400">*</span></SectionLabel>
          <Chips items={CATEGORIAS} selected={categorias} onToggle={(v) => toggleChip(categorias, setCategorias, v)} />
        </div>

        {/* Acessibilidade */}
        <div className="bg-white rounded-[18px] px-4 py-4 shadow-sm">
          <SectionLabel>Acessibilidade</SectionLabel>
          <Chips items={ACESSIBILIDADE} selected={acessibilidade} onToggle={(v) => toggleChip(acessibilidade, setAcessibilidade, v)} />
        </div>

        {/* Inscrições */}
        <div className="bg-white rounded-[18px] px-4 py-4 shadow-sm">
          <SectionLabel>Inscrições</SectionLabel>
          <Chips items={INSCRICOES} selected={inscricao} onToggle={(v) => { setInscricao(v); if (v !== "Pago") setValor(""); }} single />

          {inscricao === "Pago" && (
            <div className="mt-3">
              <p className="text-[13px] font-semibold text-[#192853] mb-1">Valor do ingresso</p>
              <div className="flex items-center border border-[#dde6f0] rounded-[10px] px-3 h-[44px] focus-within:border-[#192853] bg-[#f7fafd]">
                <span className="text-[#192853] text-[15px] mr-1 font-medium">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="flex-1 bg-transparent text-[#192853] text-[15px] outline-none placeholder:text-[#b0bec5]"
                />
              </div>
            </div>
          )}
        </div>

        {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

        <div className="flex flex-col gap-3 pb-4">
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="w-full h-[52px] rounded-full bg-[#ffe14e] text-[#192853] font-bold text-[16px] flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#192853"/>
            </svg>
            {loading ? "Publicando..." : "Publicar Evento!"}
          </button>
          <p className="text-center text-[13px] text-[#192853]/40 cursor-pointer hover:text-[#192853]/70" onClick={() => navigate("/map")}>
            Cancelar
          </p>
        </div>
      </div>

      <Navbar />
    </div>
  );
}

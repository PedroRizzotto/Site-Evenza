import { useState } from "react";
import { Logo } from "../components/Logo";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { signIn } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#515569"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#515569"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="#1f1f1f"/>
  </svg>
);

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const token = await signIn(email, senha);
      login(token);
      navigate("/map");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#192853] flex flex-col items-center px-[40px] pb-8">
      {/* Logo */}
      <div className="pt-6">
        <Logo size="large" />
      </div>

      {/* Title */}
      <p className="text-white font-semibold text-[15px] text-center mt-4 mb-6">
        Entre na sua Conta
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
        <Input
          label="Email"
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon />}
        />
        <Input
          label="Senha"
          placeholder="Senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          icon={<LockIcon />}
        />

        {/* Erro */}
        {erro && (
          <p className="text-red-400 text-sm text-center">{erro}</p>
        )}

        {/* Botão Entrar */}
        <div className="mt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 my-6" />

      {/* Botão Cadastro — secundário, menor */}
      <Link to="/register" className="w-full flex justify-center">
        <button
          type="button"
          className="flex items-center gap-2 px-6 h-[38px] rounded-full bg-white border border-white text-[#192853] text-[13px] font-medium cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ArrowRightIcon />
          Faça o seu cadastro!
        </button>
      </Link>
    </div>
  );
}

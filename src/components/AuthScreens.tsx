import React, { useState } from 'react';
import { base44 } from '../lib/base44';
import { Star, ShieldAlert, KeyRound, Mail, UserPlus, Lock } from 'lucide-react';

interface AuthScreensProps {
  onLoginSuccess: () => void;
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  const [email, setEmail] = useState('brenotonyacabamentos@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Breno Tony');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await base44.auth.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError('Credenciais inválidas.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await base44.auth.signUp(email, password, name);
      onLoginSuccess();
    } catch (err: any) {
      setError('Erro ao criar conta.');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('Link de recuperação enviado para: ' + email);
    setTimeout(() => {
      setView('reset');
    }, 2000);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Senha alterada com sucesso!');
    setTimeout(() => {
      setView('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070708] p-4 text-xs">
      <div className="w-full max-w-sm rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-5">
        
        {/* Logo and Titling */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-650/10 border border-red-500/20 text-red-500 mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-1">
            Tony CRM
          </h1>
          <p className="text-neutral-500 text-[11px]">Sistema inteligente de Leads e Acabamentos Sênior</p>
        </div>

        {error && <div className="rounded border border-red-900/30 bg-red-500/5 p-2.5 text-red-400 font-medium text-center">{error}</div>}
        {success && <div className="rounded border border-green-900/30 bg-green-500/5 p-2.5 text-green-400 font-medium text-center">{success}</div>}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">E-mail Corporativo</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Mail className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="Seu e-mail cadastrado"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-neutral-400">Senha de Acesso</label>
                <button type="button" onClick={() => setView('forgot')} className="text-red-500 text-[10px] hover:underline font-medium">Esqueceu a Senha?</button>
              </div>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Lock className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="Sua senha de acesso"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full rounded bg-red-650 hover:bg-red-600 transition p-2.5 font-semibold text-white">
              Entrar no Módulo de Operações
            </button>

            <p className="text-center text-neutral-500 text-[10.5px]">
              Novo no CRM?{' '}
              <button type="button" onClick={() => { setView('register'); setError(''); }} className="text-red-500 font-semibold hover:underline">
                Criar Nova Conta
              </button>
            </p>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Seu Nome Completo</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <UserPlus className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="Ex: Breno Tony"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">E-mail</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Mail className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="Ex: brenotonyacabamentos@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Senha</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Lock className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  placeholder="Defina uma senha"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full rounded bg-red-650 hover:bg-red-600 transition p-2.5 font-semibold text-white">
              Concluir Cadastro e Entrar
            </button>

            <p className="text-center text-neutral-500 text-[10.5px]">
              Já possui conta?{' '}
              <button type="button" onClick={() => { setView('login'); setError(''); }} className="text-red-500 font-semibold hover:underline">
                Fazer Login
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-neutral-400 text-center leading-relaxed">Insira seu e-mail cadastrado. Enviaremos um link seguro para o reatamento de sua senha corporativa.</p>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">E-mail</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Mail className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full rounded bg-red-650 hover:bg-red-600 transition p-2.5 font-semibold text-white">
              Enviar Link de Redefinição
            </button>

            <button type="button" onClick={() => setView('login')} className="w-full text-center text-neutral-400 hover:text-white underline font-semibold">
              Voltar para o Login
            </button>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <h4 className="font-semibold text-white text-center">Criar Nova Senha</h4>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Defina a Nova Senha</label>
              <div className="flex items-center rounded border border-neutral-900 bg-neutral-900/40 px-3 py-2">
                <Lock className="h-4 w-4 text-neutral-500 mr-2" />
                <input
                  type="password"
                  placeholder="Mínimo 6 dígitos"
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full rounded bg-red-650 hover:bg-red-600 transition p-2.5 font-semibold text-white">
              Salvar Nova Senha
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

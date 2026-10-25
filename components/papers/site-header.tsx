'use client';
import { useState, useEffect } from 'react';
import {
  Bell,
  Bookmark,
  BookOpen,
  Compass,
  House,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
  Sparkles,
  Crown,
  LayoutDashboard,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar } from './primitives';
import { User } from '@/lib/types';
import { ProPassModal } from './pro-modals';
import { GoogleAuthModal } from './google-auth-modal';

const navigation = [
  ['Home', '/', House],
  ['Explore', '/explore', Compass],
  ['Subjects', '/subjects', BookOpen],
  ['Upload', '/upload', Plus],
  ['Saved', '/saved', Bookmark],
  ['Community', '/community', Users],
] as const;

export function SiteHeader({
  page,
  user,
  unread,
  onNotifications,
}: {
  page: string;
  user?: User;
  unread: boolean;
  onNotifications: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [proModal, setProModal] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);

  useEffect(() => {
    const handler = () => setGoogleModal(true);
    window.addEventListener('open-google-auth', handler);
    return () => window.removeEventListener('open-google-auth', handler);
  }, []);

  const active = (href: string) => page === (href === '/' ? 'home' : href.slice(1));

  async function handleSignOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {}
    window.location.href = '/';
  }

  return (
    <>
      <header className="stitch-native stitch-header sticky top-0 left-0 w-full z-50 bg-[#070B14] border-b-2 border-slate-800 shadow-[0_6px_30px_rgba(0,0,0,0.6)]">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>

        {/* Top 2-Section Switcher & Academic Strip */}
        <div className="bg-[#050811] border-b border-slate-800/90 px-4 sm:px-8 py-1.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between text-slate-300 text-xs font-semibold gap-3 flex-wrap">
            {/* 2-Section Switcher: Normal User Section vs Admin Section */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0C1222] border border-slate-800 text-xs font-bold shrink-0">
              <a
                href="/"
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  page !== 'admin'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Normal User Section - Study Commons & Papers"
              >
                <BookOpen size={12} />
                <span>User Section</span>
              </a>
              <a
                href="/admin"
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  page === 'admin'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-sm'
                    : user?.role === 'admin'
                    ? 'text-orange-400 font-bold hover:text-orange-300'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Admin Section - Analytics & Moderation (Restricted to vihan.agrawal4@gmail.com)"
              >
                <ShieldCheck size={12} className={user?.role === 'admin' ? 'text-slate-950' : 'text-orange-400'} />
                <span>Admin Analytics</span>
                {user?.role === 'admin' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Admin active"></span>
                ) : null}
              </a>
            </div>

            {/* Academic Notice & Role Status */}
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-bold font-mono bg-[#131B2E] px-2.5 py-0.5 rounded-lg border border-orange-500/30">
                  <ShieldCheck size={13} />
                  <span>Admin: vihan.agrawal4@gmail.com</span>
                </span>
              ) : user?.plan === 'premium' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/60 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <Crown size={13} className="text-amber-400 fill-amber-400" />
                  <span>PRO Active</span>
                </span>
              ) : (
                <button
                  onClick={() => setProModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/60 text-amber-300 text-xs font-black uppercase tracking-wider ambient-gold-pulse hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  <Crown size={13} className="text-amber-400" />
                  <span>PRO Pass (₹299/mo)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="h-16 md:h-20 max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
          {/* Brand: PaperVault PRO */}
          <a href="/" className="flex items-center gap-3 shrink-0 group stitch-brand" aria-label="PaperVault PRO home">
            <span className="relative flex items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-orange-600/20 border-2 border-orange-500/50 shadow-[0_0_25px_rgba(255,101,0,0.3)] group-hover:scale-105 transition-transform">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
                PV
              </span>
            </span>
            <span className="flex flex-col">
              <span className="text-xl md:text-2xl text-white tracking-tight leading-none font-black flex items-center gap-1.5">
                PaperVault
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[11px] tracking-wider uppercase shadow-xs">
                  <Crown size={11} className="fill-slate-950" /> PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-normal leading-tight mt-1 font-semibold hidden sm:block">
                CBSE &amp; Boards Practice &amp; Solutions Vault
              </span>
            </span>
          </a>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-center gap-1.5 bg-[#0C1222] p-1.5 rounded-2xl border-2 border-slate-800"
          >
            {navigation.map(([name, href, Icon]) => (
              <a
                key={href}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
                className={
                  'px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ' +
                  (active(href)
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80')
                }
              >
                {name === 'Home' && <Icon size={15} />} {name}
              </a>
            ))}

            {/* Admin Section Direct Link */}
            {user?.role === 'admin' ? (
              <a
                href="/admin"
                className={
                  'px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ' +
                  (page === 'admin'
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'text-orange-400 hover:bg-orange-500/10 border border-orange-500/30')
                }
              >
                <ShieldCheck size={14} />
                <span>Admin Analytics</span>
              </a>
            ) : (
              <a
                href="/admin"
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl flex items-center gap-1.5"
                title="Admin portal (restricted to vihan.agrawal4@gmail.com)"
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </a>
            )}

            {/* Gold PRO Pass Button in Nav */}
            <button
              onClick={() => setProModal(true)}
              className="px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Crown size={14} className="fill-slate-950" />
              <span>PRO Pass</span>
            </button>
          </nav>

          {/* Right Search, Upload, Notifications, Account / Google Sign-in */}
          <div className="flex items-center gap-2 sm:gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                location.href = '/explore?q=' + encodeURIComponent(search);
              }}
              className="relative hidden sm:block w-40 md:w-48 stitch-header-search"
            >
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search papers"
                placeholder="Search papers, codes..."
                className="w-full bg-[#0C1222] text-white placeholder:text-slate-500 border-2 border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
            </form>

            <a
              href="/upload"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl border-2 border-orange-400/50 shadow-lg hover:scale-105 active:scale-95 transition-transform stitch-upload"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Upload Paper</span>
            </a>

            <button
              onClick={onNotifications}
              className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 stitch-notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Your account" className="rounded-full cursor-pointer">
                  <Avatar name={user.display_name} src={user.avatar ? '/api/avatar/' + user.id : undefined} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0C1222] border-2 border-slate-800 text-slate-200 min-w-56 p-1.5 rounded-2xl shadow-2xl">
                  <div className="px-3 py-2.5 border-b border-slate-800">
                    <div className="text-xs font-black text-white truncate">{user.display_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{user.email || user.username}</div>
                    {user.role === 'admin' ? (
                      <div className="mt-1 text-[10px] text-orange-400 font-black uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={12} /> Sole Administrator
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Normal User (Student)
                      </div>
                    )}
                  </div>
                  <DropdownMenuItem onClick={() => (location.href = '/')}>
                    <BookOpen className="mr-2" size={15} />
                    <span>User Section (Papers)</span>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => (location.href = '/admin')} className="text-orange-400 font-bold">
                      <LayoutDashboard className="mr-2 text-orange-400" size={15} />
                      <span>Admin Analytics Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => (location.href = '/profile')}>
                    <UserRound className="mr-2" size={15} />
                    <span>My profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (location.href = '/saved')}>
                    <Bookmark className="mr-2" size={15} />
                    <span>Saved papers</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setProModal(true)} className="text-amber-400 font-bold">
                    <Crown className="mr-2 text-amber-400" size={15} />
                    <span>PRO Pass Benefits</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-rose-400">
                    <LogOut className="mr-2" size={15} />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setGoogleModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-slate-200"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="xl:hidden p-2 text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav
            id="compact-navigation"
            aria-label="Additional navigation"
            className="xl:hidden grid grid-cols-2 gap-2 border-t border-slate-800 p-4 bg-[#070B14]"
          >
            {/* Section Switcher in Mobile Drawer */}
            <a
              href="/"
              className={`col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black ${
                page !== 'admin' ? 'bg-orange-500 text-slate-950' : 'bg-[#0C1222] text-slate-300 border border-slate-800'
              }`}
            >
              <BookOpen size={15} /> User Section
            </a>
            <a
              href="/admin"
              className={`col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black ${
                page === 'admin' ? 'bg-orange-500 text-slate-950' : 'bg-[#0C1222] text-slate-300 border border-slate-800'
              }`}
            >
              <ShieldCheck size={15} /> Admin Analytics
            </a>

            {[...navigation, ['Profile', '/profile', UserRound]].map(([name, href, Icon]: any) => (
              <a
                key={href}
                href={href}
                className={
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ' +
                  (active(href)
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'text-slate-300 bg-[#0C1222] border border-slate-800')
                }
              >
                <Icon size={16} />
                {name}
              </a>
            ))}
            <button
              onClick={() => setProModal(true)}
              className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md"
            >
              <Crown size={16} /> PRO Pass (₹299/mo)
            </button>
            {!user && (
              <button
                onClick={() => setGoogleModal(true)}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black bg-white text-slate-950 shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </nav>
        )}
      </header>

      <ProPassModal open={proModal} onOpenChange={setProModal} />
      <GoogleAuthModal
        open={googleModal}
        onOpenChange={setGoogleModal}
        defaultEmail="vihan.agrawal4@gmail.com"
      />
    </>
  );
}

export function MobileNavigation({ page }: { page: string }) {
  return (
    <nav className="mobile-nav bg-[#070B14] border-t border-slate-800" aria-label="Mobile navigation">
      {[
        ['Home', '/', House],
        ['Explore', '/explore', Compass],
        ['Upload', '/upload', Plus],
        ['Saved', '/saved', Bookmark],
        ['Profile', '/profile', UserRound],
      ].map(([name, href, Icon]: any) => (
        <a
          key={name}
          className={page === (href === '/' ? 'home' : href.slice(1)) ? 'active text-amber-400' : ''}
          aria-current={page === (href === '/' ? 'home' : href.slice(1)) ? 'page' : undefined}
          href={href}
        >
          <Icon size={21} />
          <span>{name}</span>
        </a>
      ))}
    </nav>
  );
}

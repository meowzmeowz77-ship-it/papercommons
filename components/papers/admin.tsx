'use client';
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  BarChart3,
  FileText,
  Users,
  Flag,
  MessageSquare,
  BookOpen,
  Settings,
  Eye,
  Download,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { api, date, compact } from '@/lib/client';
import { toast } from 'sonner';
import { User } from '@/lib/types';
import { Picker, Loading } from './primitives';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AdminPremium } from './admin-premium';
import { AdminAnalytics } from './admin-analytics';
import { GoogleAuthModal } from './google-auth-modal';

export function AdminPage({ user }: { user?: User }) {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Analytics');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [meta, setMeta] = useState<any>({});
  const [filter, setFilter] = useState('All');
  const [days, setDays] = useState(30);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);

  const load = () =>
    api('admin?days=' + days)
      .then((data) => {
        setD(data);
        setError('');
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user?.id, days]);

  useEffect(() => {
    const requested = new URLSearchParams(location.search).get('tab');
    if (requested && ['Analytics', 'Overview', 'Papers', 'Users', 'Premium', 'Settings', 'Reports', 'Comments', 'Subjects', 'Boards', 'Academic metadata'].includes(requested)) {
      setTab(requested);
    }
  }, []);

  async function handleInlineAdminLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inlinePassword.trim()) {
      toast.error('Please enter the administrator password.');
      return;
    }
    setInlineLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vihan.agrawal4@gmail.com',
          name: 'Vihan Agrawal',
          password: inlinePassword.trim(),
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Administrator authentication failed.');

      toast.success('Administrator authenticated successfully!');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Incorrect administrator password. Access denied.');
    } finally {
      setInlineLoading(false);
    }
  }

  // Access Control: Only vihan.agrawal4@gmail.com with verified password can view this section
  if (!user || user.role !== 'admin') {
    return (
      <>
        <div className="signin-panel panel bg-[#0C1222] border-2 border-slate-800 p-8 sm:p-12 rounded-2xl max-w-xl mx-auto text-center flex flex-col items-center gap-4 my-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border-2 border-orange-500/40 text-orange-400 flex items-center justify-center shadow-lg">
            <ShieldCheck size={36} />
          </div>
          <span className="overline text-orange-400 font-black tracking-widest text-xs uppercase">
            ADMIN ANALYTICS PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Access Restricted
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            The site analytics dashboard, live visitor telemetry, and moderation tools are exclusively restricted to{' '}
            <strong className="text-orange-300">vihan.agrawal4@gmail.com</strong> with administrator password authentication.
          </p>

          {user ? (
            <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-700 text-xs text-slate-300 w-full text-left my-1 shadow-inner">
              <div className="text-slate-400 font-semibold mb-1">Current Logged-in Account:</div>
              <div className="font-extrabold text-white flex items-center justify-between text-sm">
                <span>{user.display_name} ({user.email || user.username})</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase border border-slate-700">
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-amber-300 mt-2 font-medium">
                You are currently signed in as a student/normal user. To unlock administrator privileges, enter the administrator password below.
              </p>
            </div>
          ) : null}

          {/* Secure Admin Password Authentication Form */}
          <form onSubmit={handleInlineAdminLogin} className="w-full bg-[#131B2E] border-2 border-orange-500/40 rounded-xl p-4 sm:p-5 text-left flex flex-col gap-3 my-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-orange-400" />
                <span className="text-xs font-bold text-white">Administrator Credentials</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold">
                vihan.agrawal4@gmail.com
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300 font-semibold">
                Admin Password:
              </label>
              <input
                type="password"
                value={inlinePassword}
                onChange={(e) => setInlinePassword(e.target.value)}
                placeholder="Enter administrator password..."
                className="w-full bg-[#0C1222] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={inlineLoading || !inlinePassword.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-1"
            >
              {inlineLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Authenticate &amp; Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-1">
            <a href="/" className="btn w-full sm:w-auto justify-center font-bold">
              ← Return to User Section
            </a>
          </div>
        </div>
        <GoogleAuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultEmail="vihan.agrawal4@gmail.com"
          initialMode="admin"
          onSuccess={() => window.location.reload()}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <ShieldCheck size={30} />
        <h1>{user.role === 'admin' ? 'Couldn’t load administration' : 'Access restricted'}</h1>
        <p>{error}</p>
        {user.role === 'admin' && (
          <button className="btn primary" onClick={load}>
            Retry
          </button>
        )}
        <a className="btn" href="/">
          ← Back to User Section
        </a>
      </div>
    );
  }

  if (!d) return <Loading />;

  const open = (kind: string, id: string, action: string, extra: any = {}) => {
    setModal({ kind, id, action });
    setReason('');
    setMeta(extra);
  };
  const matching = (list: any[]) => list.filter((x) => JSON.stringify(x).toLowerCase().includes(query.toLowerCase()));
  const taxonomy = d.taxonomy.filter((t: any) =>
    t.kind === (tab === 'Subjects' ? 'subject' : tab === 'Boards' ? 'board' : filter === 'All' ? 'grade' : filter)
  );

  return (
    <>
      {/* Admin Section Top Header Banner with Role Indicator and User Section Switcher */}
      <div className="page-heading admin-heading flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0C1222] border-2 border-slate-800 mb-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="overline text-orange-400 font-black tracking-widest text-xs uppercase">
              ADMINISTRATOR SECTION
            </span>
            <span className="text-slate-600 font-bold">•</span>
            <span className="text-xs font-mono text-orange-300/90 font-bold bg-[#131B2E] px-2.5 py-0.5 rounded-md border border-orange-500/30">
              {user.email || 'vihan.agrawal4@gmail.com'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Site Analytics &amp; Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Real-time traffic telemetry, daily page views, student engagement trends, and moderation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="btn text-xs font-black bg-[#131B2E] hover:bg-[#1E293B] border-2 border-slate-700 hover:border-slate-500 flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={14} className="text-orange-400" />
            <span>Switch to User Section</span>
          </a>
          <span className="admin-badge px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-500/50 text-orange-300 font-black text-xs flex items-center gap-1.5 shadow-md">
            <ShieldCheck size={16} className="text-orange-400" />
            <span>Super Admin</span>
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs — Analytics is the First and Primary Tab */}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setQuery('');
          setFilter('All');
        }}
      >
        <TabsList className="feed-tabs admin-tabs">
          {[
            'Analytics',
            'Overview',
            'Papers',
            'Users',
            'Reports',
            'Comments',
            'Subjects',
            'Boards',
            'Academic metadata',
            'Premium',
            'Settings',
          ].map((t) => (
            <TabsTrigger key={t} value={t}>
              {t === 'Analytics' ? '📊 ' + t : t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Section Content */}
      {tab === 'Analytics' ? (
        <AdminAnalytics data={d} days={days} onDays={setDays} />
      ) : tab === 'Overview' ? (
        <>
          <div className="stat-grid admin-stats">
            {Object.entries(d.stats).map(([k, v]: any) => (
              <div className="stat-card" key={k}>
                <span>
                  {k === 'users'
                    ? 'registered accounts'
                    : k === 'active_users'
                    ? 'active students (30 days)'
                    : k.replace(/_/g, ' ')}
                </span>
                <b>{compact(v)}</b>
              </div>
            ))}
          </div>
          <div className="admin-overview">
            <section className="panel">
              <h2>Needs your attention</h2>
              <button className="review-line" onClick={() => setTab('Papers')}>
                <FileText size={22} />
                <span>
                  <strong>{d.stats.pending} papers awaiting review</strong>
                  <small>Check clarity, metadata, permission and privacy.</small>
                </span>
                <span>Review</span>
              </button>
              <button className="review-line" onClick={() => setTab('Reports')}>
                <Flag size={22} />
                <span>
                  <strong>{d.stats.reports} unresolved reports</strong>
                  <small>Help keep the library accurate and safe.</small>
                </span>
                <span>Review</span>
              </button>
            </section>
            <section className="panel">
              <h2>Recent moderation</h2>
              {d.audit.length ? (
                d.audit.slice(0, 6).map((a: any) => (
                  <div className="audit-item" key={a.id}>
                    <strong>{a.action}</strong>
                    <p>{a.reason}</p>
                    <small>{date(a.created_at)}</small>
                  </div>
                ))
              ) : (
                <p className="muted">Moderation decisions and reasons will appear here.</p>
              )}
            </section>
          </div>
        </>
      ) : tab === 'Premium' ? (
        <AdminPremium data={d} user={user} onRefresh={load} />
      ) : tab === 'Settings' ? (
        <section className="panel settings-panel">
          <h2>Upload moderation</h2>
          <p>Manual review is recommended while the community is getting started.</p>
          <Picker
            value={d.settings.find((s: any) => s.key === 'moderation')?.value || 'manual'}
            options={['manual', 'automatic']}
            onChange={(v) => open('settings', '', 'update', { mode: v })}
          />
          <p className="muted">
            Automatic mode publishes files after format, size, signature and duplicate checks. These checks do not
            replace malware scanning or human privacy review.
          </p>
          <h3>Account security &amp; Roles</h3>
          <p>
            Admin access is strictly restricted to <strong className="text-orange-400">vihan.agrawal4@gmail.com</strong>.
            Student accounts cannot promote themselves.
          </p>
          <h3>Future integrations</h3>
          <p>
            Premium papers and test access are managed in the Premium tab. Stripe payments and AVK evaluation are not
            connected.
          </p>
        </section>
      ) : (
        <section className="panel admin-table-panel">
          <div className="table-controls">
            <div className="small-search">
              <Search size={18} />
              <input
                aria-label={'Search ' + tab}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={'Search ' + tab.toLowerCase() + '…'}
              />
            </div>
            {tab === 'Papers' && (
              <Picker
                value={filter}
                onChange={setFilter}
                options={['All', 'pending', 'approved', 'draft', 'rejected', 'hidden', 'deleted']}
                placeholder="Status"
              />
            )}
            {['Subjects', 'Boards', 'Academic metadata'].includes(tab) && (
              <>
                {tab === 'Academic metadata' && (
                  <Picker
                    value={filter}
                    onChange={setFilter}
                    options={['grade', 'exam', 'school']}
                    placeholder="Grades"
                  />
                )}
                <button
                  className="btn primary"
                  onClick={() =>
                    open('taxonomy', '', 'create', {
                      kind: tab === 'Subjects' ? 'subject' : tab === 'Boards' ? 'board' : filter === 'All' ? 'grade' : filter,
                      name: '',
                      position: 0,
                      enabled: true,
                    })
                  }
                >
                  <Plus size={16} />Add
                </button>
              </>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {['Subjects', 'Boards', 'Academic metadata'].includes(tab)
                    ? 'Name'
                    : tab === 'Users'
                    ? 'User'
                    : tab === 'Reports'
                    ? 'Report'
                    : 'Content'}
                </TableHead>
                <TableHead>Status / details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tab === 'Papers' &&
                matching(d.papers)
                  .filter((p) => filter === 'All' || p.status === filter)
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <a href={'/papers/' + p.slug}>
                          <strong>{p.title}</strong>
                        </a>
                        <small>
                          {p.board} · Class {p.grade} · {p.subject}
                          <br />@{p.username}
                        </small>
                      </TableCell>
                      <TableCell>
                        <span className={'status-badge ' + p.status}>{p.status}</span>
                        <small>{date(p.created_at)}</small>
                      </TableCell>
                      <TableCell>
                        <div className="table-actions">
                          {['approve', 'reject', 'hide', 'restore', 'feature', 'edit', 'delete'].map((a) => (
                            <button key={a} className="text-btn" onClick={() => open('paper', p.id, a, p)}>
                              {a}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              {tab === 'Users' &&
                matching(d.users).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <a href={'/profile/' + u.id}>
                        <strong>{u.display_name}</strong>
                        <small>@{u.username}</small>
                      </a>
                    </TableCell>
                    <TableCell>
                      {u.status}
                      <small>
                        {u.role} · Joined {date(u.created_at)}
                      </small>
                    </TableCell>
                    <TableCell>
                      <div className="table-actions">
                        {['warn', 'suspend', 'ban', 'restore'].map((a) => (
                          <button className="text-btn" key={a} onClick={() => open('user', u.id, a)}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {tab === 'Reports' &&
                matching(d.reports).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <strong>{r.reason}</strong>
                      <small>{r.title || 'Comment report'}</small>
                      <p>{r.details}</p>
                    </TableCell>
                    <TableCell>
                      {r.status}
                      <small>{date(r.created_at)}</small>
                    </TableCell>
                    <TableCell>
                      <button
                        className="btn"
                        disabled={r.status === 'resolved'}
                        onClick={() => open('report', r.id, 'resolve')}
                      >
                        Resolve
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              {tab === 'Comments' &&
                matching(d.comments).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p>{c.body}</p>
                      <small>@{c.username}</small>
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>
                      <button
                        className="btn"
                        onClick={() => open('comment', c.id, c.status === 'active' ? 'remove' : 'restore')}
                      >
                        {c.status === 'active' ? 'Remove' : 'Restore'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              {['Subjects', 'Boards', 'Academic metadata'].includes(tab) &&
                matching(taxonomy).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <strong>{t.name}</strong>
                    </TableCell>
                    <TableCell>
                      {t.enabled ? 'Enabled' : 'Disabled'} · Position {t.position}
                    </TableCell>
                    <TableCell>
                      <button
                        className="btn"
                        onClick={() => open('taxonomy', t.id, 'edit', { ...t, enabled: !!t.enabled })}
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {((tab === 'Reports' && !d.reports.length) || (tab === 'Comments' && !d.comments.length)) && (
            <p className="quiet-empty">Nothing here yet. You’re all caught up.</p>
          )}
        </section>
      )}

      {/* Moderation Dialog */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal?.action} {modal?.kind}
            </DialogTitle>
            <DialogDescription>
              Changes are recorded in the moderation history. Removed content is retained for restoration.
            </DialogDescription>
          </DialogHeader>
          {modal?.kind === 'taxonomy' && (
            <>
              <label>
                Name
                <input value={meta.name || ''} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
              </label>
              <label>
                Sort position
                <input
                  type="number"
                  value={meta.position || 0}
                  onChange={(e) => setMeta({ ...meta, position: Number(e.target.value) })}
                />
              </label>
              <label className="check-label">
                <Switch checked={!!meta.enabled} onCheckedChange={(v) => setMeta({ ...meta, enabled: v })} />
                Enabled
              </label>
            </>
          )}
          {modal?.kind === 'paper' &&
            modal.action === 'edit' &&
            ['title', 'description', 'school', 'chapters'].map((k) => (
              <label key={k}>
                {k}
                <input value={meta[k] || ''} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} />
              </label>
            ))}
          <label>
            Reason for this change
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain this decision for the moderation record."
            />
          </label>
          <button
            className="btn primary"
            onClick={async () => {
              try {
                await api('admin/' + modal.kind, { ...meta, id: modal.id, action: modal.action, reason });
                setModal(null);
                load();
                toast.success('Moderation change saved');
              } catch (e: any) {
                toast.error(e.message);
              }
            }}
          >
            Confirm change
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

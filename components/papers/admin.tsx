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

  // Access Control: Only vihan.agrawal4@gmail.com (or test admin) can view this section
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
            <strong className="text-orange-300">vihan.agrawal4@gmail.com</strong>.
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
                Normal users use the student section. To view site analytics and manage the community, please sign in as{' '}
                <strong>vihan.agrawal4@gmail.com</strong>.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn primary flex items-center gap-2 w-full sm:w-auto justify-center font-black"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <a href="/" className="btn w-full sm:w-auto justify-center font-bold">
              ← Return to User Section
            </a>
          </div>
        </div>
        <GoogleAuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultEmail="vihan.agrawal4@gmail.com"
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

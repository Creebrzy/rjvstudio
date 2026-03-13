'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Image, Film, Play } from 'lucide-react';

const SECTIONS = ['hero', 'gallery', 'shows', 'studios', 'team', 'about'];

const blank = { title: '', section: 'gallery', source_url: '', alt_text: '', sort_order: 0, force_type: '' };

function MediaThumb({ item, onPreview }: { item: any; onPreview: (item: any) => void }) {
  if (item.media_type === 'video') {
    return (
      <div className="aspect-video relative bg-void overflow-hidden cursor-pointer group" onClick={() => onPreview(item)}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-void-3">
            <Film size={24} className="text-gold/30" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gold/80 flex items-center justify-center group-hover:bg-gold transition-colors">
            <Play size={14} className="text-void ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video relative bg-void-3 overflow-hidden cursor-pointer group" onClick={() => onPreview(item)}>
      <img src={item.direct_url} alt={item.alt_text || item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  );
}

export default function AdminMedia() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [preview, setPreview] = useState<any | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/media');
    const data = await r.json();
    if (Array.isArray(data)) setMedia(data);
    setLoading(false);
  }

  async function save() {
    if (!form.source_url || !form.title) return;
    setSaving(true);
    await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ ...blank });
    setAdding(false);
    setSaving(false);
    load();
  }

  async function toggle(item: any) {
    await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active, sort_order: item.sort_order }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this media?')) return;
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const filtered = media
    .filter(m => filter === 'all' || m.section === filter)
    .filter(m => typeFilter === 'all' || m.media_type === typeFilter);

  const imgCount = media.filter(m => m.media_type === 'image').length;
  const vidCount = media.filter(m => m.media_type === 'video').length;

  return (
    <div>
      <div className="gold-line mb-4" />
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-5xl text-white">MEDIA MANAGER</h1>
          <p className="font-mono text-white/30 text-xs tracking-widest mt-2">
            {imgCount} photos · {vidCount} videos
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-gold text-void font-mono text-xs px-5 py-3 tracking-widest uppercase hover:bg-gold-light transition-colors">
          <Plus size={14} /> Add Media
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-gold/5 border border-gold/20 p-5 mb-8 font-mono text-xs text-white/40 leading-relaxed space-y-1">
        <div><span className="text-gold">PHOTOS:</span> Google Drive → Share → "Anyone with link" → Copy link → Paste below</div>
        <div><span className="text-gold">VIDEOS:</span> YouTube link, Google Drive video link, or direct .mp4 URL — all work automatically</div>
        <div><span className="text-gold">TIP:</span> For Google Drive videos, use the share link and toggle "Force as video" below</div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-void-2 border border-gold/30 p-6 mb-8">
          <div className="font-mono text-gold text-xs tracking-widest uppercase mb-6">Add Photo or Video</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none"
                placeholder="Studio A — Control Room" />
            </div>
            <div>
              <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">Section *</label>
              <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none capitalize">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">URL (Google Drive, YouTube, or direct link) *</label>
            <input value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
              className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none"
              placeholder="https://drive.google.com/file/d/... or https://youtu.be/..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">Force Type</label>
              <select value={form.force_type} onChange={e => setForm(f => ({ ...f, force_type: e.target.value }))}
                className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none">
                <option value="">Auto-detect</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">Alt Text</label>
              <input value={form.alt_text} onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))}
                className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none"
                placeholder="RJV Studio recording session" />
            </div>
            <div>
              <label className="font-mono text-white/30 text-xs tracking-widest uppercase block mb-2">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full bg-void border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-gold outline-none"
                placeholder="0" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving || !form.title || !form.source_url}
              className="bg-gold text-void font-mono text-xs px-8 py-3 tracking-widest uppercase hover:bg-gold-light transition-colors disabled:opacity-40">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setAdding(false); setForm({ ...blank }); }}
              className="border border-white/10 text-white/40 font-mono text-xs px-6 py-3 tracking-widest uppercase hover:border-white/30 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-2 mr-4">
          {['all', 'image', 'video'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`font-mono text-xs px-4 py-2 tracking-widest uppercase transition-colors flex items-center gap-1.5 ${typeFilter === t ? 'bg-gold text-void' : 'border border-white/10 text-white/40 hover:border-gold hover:text-gold'}`}>
              {t === 'image' && <Image size={10} />}
              {t === 'video' && <Film size={10} />}
              {t}
            </button>
          ))}
        </div>
        {['all', ...SECTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`font-mono text-xs px-4 py-2 tracking-widest uppercase transition-colors ${filter === s ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/5 mb-8">
        {SECTIONS.map(s => {
          const count = media.filter(m => m.section === s).length;
          const vids = media.filter(m => m.section === s && m.media_type === 'video').length;
          return (
            <div key={s} className="bg-void-2 p-3 text-center">
              <div className="font-display text-2xl text-gold">{count}</div>
              <div className="font-mono text-white/20 text-xs tracking-widest uppercase mt-0.5">{s}</div>
              {vids > 0 && <div className="font-mono text-gold/40 text-xs mt-0.5">{vids} vid</div>}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-white/30 font-mono text-sm py-12 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-void-2 border border-white/5 p-16 text-center">
          <div className="flex gap-3 justify-center mb-4">
            <Image size={24} className="text-white/10" />
            <Film size={24} className="text-white/10" />
          </div>
          <div className="font-mono text-white/20 text-sm">No media yet — add photos or videos above</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(item => (
            <div key={item.id} className={`group bg-void-3 border transition-colors ${item.is_active ? 'border-white/5 hover:border-gold/30' : 'border-white/5 opacity-40'}`}>
              <MediaThumb item={item} onPreview={setPreview} />
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.media_type === 'video'
                    ? <Film size={10} className="text-gold shrink-0" />
                    : <Image size={10} className="text-gold/50 shrink-0" />}
                  <div className="font-display text-sm text-white truncate">{item.title}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gold text-xs uppercase tracking-widest">{item.section}</span>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(item)} className="text-white/30 hover:text-gold transition-colors">
                      {item.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                      <ExternalLink size={12} />
                    </a>
                    <button onClick={() => remove(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-void/95 z-50 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {preview.media_type === 'video' ? (
              <div className="aspect-video w-full">
                {preview.direct_url.includes('youtube.com/embed') ? (
                  <iframe src={preview.direct_url} className="w-full h-full" allowFullScreen />
                ) : preview.direct_url.includes('drive.google.com') ? (
                  <iframe src={preview.direct_url} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={preview.direct_url} controls className="w-full h-full" />
                )}
              </div>
            ) : (
              <img src={preview.direct_url} alt={preview.alt_text || preview.title} className="w-full max-h-[80vh] object-contain" />
            )}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="font-display text-xl text-white">{preview.title}</div>
                <div className="font-mono text-gold text-xs tracking-widest uppercase mt-1">{preview.section} · {preview.media_type}</div>
              </div>
              <button onClick={() => setPreview(null)} className="font-mono text-white/30 hover:text-white text-xs tracking-widest uppercase">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

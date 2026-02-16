import { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { tweetAPI } from '../api';

export default function RightPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recentTweets, setRecentTweets] = useState([]);

    useEffect(() => {
        tweetAPI.list()
            .then(data => setRecentTweets((data || []).slice(0, 5)))
            .catch(() => { });
    }, []);

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return (
        <aside className="right-panel">
            {/* Search */}
            <div style={{
                position: 'relative',
                marginBottom: 16,
                marginTop: 4,
            }}>
                <Search size={18} style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                }} />
                <input
                    type="text"
                    placeholder="Search DjangoTweet"
                    className="form-input"
                    style={{
                        paddingLeft: 44,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)',
                    }}
                />
            </div>

            {/* What's New - Recent Activity */}
            <div className="rp-section">
                <div className="rp-section-title">
                    <Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-violet)' }} />
                    What's New
                </div>
                {recentTweets.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        No recent activity yet.
                    </div>
                ) : (
                    recentTweets.map(tweet => (
                        <div
                            key={tweet.id}
                            className="rp-item"
                            onClick={() => navigate(`/tweet/${tweet.id}`)}
                            style={{ gap: 10 }}
                        >
                            <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                                {tweet.user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                        {tweet.user?.display_name || tweet.user?.username}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {timeAgo(tweet.created_at)}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '0.82rem',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginTop: 2,
                                }}>
                                    {tweet.text}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    {tweet.like_count > 0 && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Heart size={12} fill="var(--accent-pink)" color="var(--accent-pink)" /> {tweet.like_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Links */}
            <div className="rp-section">
                <div className="rp-section-title">Explore</div>
                {[
                    { tag: '#Django', desc: 'Backend framework' },
                    { tag: '#React', desc: 'Frontend library' },
                    { tag: '#Python', desc: 'Programming language' },
                ].map((item, i) => (
                    <div key={i} className="rp-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                        <span className="rp-trending-name">{item.tag}</span>
                        <span className="rp-trending-count">{item.desc}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="rp-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Project by <strong style={{ color: 'var(--text-secondary)' }}>Prem Dhumal</strong>
                </span>
            </div>
        </aside>
    );
}

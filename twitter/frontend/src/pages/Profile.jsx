import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react';
import { profileAPI } from '../api';
import { useAuth } from '../App';
import TweetCard from '../components/TweetCard';
import { tweetAPI } from '../api';

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [deleteId, setDeleteId] = useState(null);

    const isOwnProfile = user && user.username === username;

    const fetchData = async () => {
        try {
            const [p, t] = await Promise.all([
                profileAPI.get(username),
                profileAPI.tweets(username),
            ]);
            setProfile(p);
            setTweets(t);
            setEditData({ display_name: p.display_name || '', bio: p.bio || '', location: p.location || '', website: p.website || '' });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [username]);

    const handleSaveProfile = async () => {
        try {
            const data = await profileAPI.update(username, editData);
            setProfile(prev => ({ ...prev, ...data }));
            setEditing(false);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await tweetAPI.delete(deleteId);
            setTweets(prev => prev.filter(t => t.id !== deleteId));
            setProfile(prev => ({ ...prev, tweet_count: (prev.tweet_count || 1) - 1 }));
        } catch (err) { console.error(err); }
        setDeleteId(null);
    };

    if (loading) {
        return (
            <>
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Profile</h2>
                </div>
                <div className="loading-spinner"><div className="spinner"></div></div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Profile</h2>
                </div>
                <div className="empty-state">
                    <h3>User not found</h3>
                    <p>This account doesn't exist.</p>
                </div>
            </>
        );
    }

    const joinDate = new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <>
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2>{profile.display_name || profile.username}</h2>
                    <div className="page-header-sub">{profile.tweet_count || 0} tweets</div>
                </div>
            </div>

            {/* Header image */}
            <div className="profile-header-img"></div>

            {/* Profile info */}
            <div className="profile-info">
                <div className="profile-avatar-wrap">
                    <div className="avatar avatar-xl">
                        {profile.username?.[0]?.toUpperCase()}
                    </div>
                </div>

                <div className="profile-actions">
                    {isOwnProfile && (
                        <button className="profile-edit-btn" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit profile'}
                        </button>
                    )}
                </div>

                {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                        <div className="form-group">
                            <label className="form-label">Display Name</label>
                            <input
                                className="form-input"
                                value={editData.display_name}
                                onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                                placeholder="Your display name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea
                                className="form-input"
                                value={editData.bio}
                                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell the world about yourself"
                                style={{ minHeight: 80, resize: 'vertical' }}
                                maxLength={160}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                className="form-input"
                                value={editData.location}
                                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Location"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input
                                className="form-input"
                                value={editData.website}
                                onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://example.com"
                            />
                        </div>
                        <button className="compose-submit-btn" style={{ alignSelf: 'flex-start' }} onClick={handleSaveProfile}>
                            Save
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="profile-name">{profile.display_name || profile.username}</div>
                        <div className="profile-handle">@{profile.username}</div>

                        {profile.bio && (
                            <div className="profile-bio">{profile.bio}</div>
                        )}

                        <div className="profile-meta">
                            {profile.location && (
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <MapPin size={16} style={{ marginRight: 4 }} /> {profile.location}
                                </span>
                            )}
                            {profile.website && (
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <LinkIcon size={16} style={{ marginRight: 4 }} />
                                    <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a>
                                </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarDays size={16} style={{ marginRight: 4 }} /> Joined {joinDate}
                            </span>
                        </div>

                        <div className="profile-stats">
                            <span>
                                <span className="profile-stat-val">{profile.tweet_count || 0}</span>
                                <span className="profile-stat-label">Tweets</span>
                            </span>
                            <span>
                                <span className="profile-stat-val">{profile.like_count || 0}</span>
                                <span className="profile-stat-label">Likes</span>
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Tweets */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
                {tweets.length === 0 ? (
                    <div className="empty-state">
                        <h3>No tweets yet</h3>
                        <p>When {isOwnProfile ? 'you' : `@${profile.username}`} posts, they'll show up here.</p>
                    </div>
                ) : (
                    tweets.map(t => (
                        <TweetCard key={t.id} tweet={t} onDelete={handleDelete} />
                    ))
                )}
            </div>

            {/* Delete confirm */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-title">Delete Tweet?</div>
                        <div className="confirm-text">This can't be undone.</div>
                        <div className="confirm-btns">
                            <button className="confirm-delete-btn" onClick={confirmDelete}>Delete</button>
                            <button className="confirm-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { tweetAPI } from '../api';
import { useAuth } from '../App';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function TweetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tweet, setTweet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeAnim, setLikeAnim] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                const data = await tweetAPI.detail(id);
                setTweet(data);
                setLiked(data.is_liked);
                setLikeCount(data.like_count || 0);
            } catch {
                navigate('/feed');
            } finally {
                setLoading(false);
            }
        };
        fetchTweet();
    }, [id, navigate]);

    const handleLike = async () => {
        if (!user) return navigate('/login');
        try {
            const data = await tweetAPI.like(id);
            setLiked(data.liked);
            setLikeCount(data.like_count);
            if (data.liked) {
                setLikeAnim(true);
                setTimeout(() => setLikeAnim(false), 300);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        try {
            await tweetAPI.delete(id);
            navigate('/feed');
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <>
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Tweet</h2>
                </div>
                <div className="loading-spinner"><div className="spinner"></div></div>
            </>
        );
    }

    if (!tweet) return null;

    const isOwner = user && tweet.user?.id === user.id;

    return (
        <>
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Tweet</h2>
            </div>

            <div style={{ padding: 16 }}>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div
                        className="avatar avatar-lg"
                        onClick={() => navigate(`/profile/${tweet.user?.username}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        {tweet.user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{ fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => navigate(`/profile/${tweet.user?.username}`)}
                        >
                            {tweet.user?.display_name || tweet.user?.username}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                            @{tweet.user?.username}
                        </div>
                    </div>

                    {isOwner && (
                        <div style={{ position: 'relative' }}>
                            <button className="tweet-more-btn" style={{ position: 'static' }}
                                onClick={() => setShowMenu(!showMenu)}>
                                <MoreHorizontal size={18} />
                            </button>
                            {showMenu && (
                                <div className="tweet-dropdown" style={{ top: '100%', right: 0 }}>
                                    <button className="tweet-dropdown-item" onClick={() => {
                                        setShowMenu(false);
                                        navigate(`/tweet/${id}/edit`);
                                    }}>
                                        <Pencil size={18} /> Edit tweet
                                    </button>
                                    <button className="tweet-dropdown-item danger" onClick={() => { setShowMenu(false); setShowDelete(true); }}>
                                        <Trash2 size={18} /> Delete tweet
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tweet text */}
                <div style={{ fontSize: '1.4rem', lineHeight: 1.4, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                    {tweet.text}
                </div>

                {/* Photo */}
                {tweet.photo_url && (
                    <div className="tweet-image" style={{ marginBottom: 16 }}>
                        <img src={tweet.photo_url} alt="" />
                    </div>
                )}

                {/* Timestamp */}
                <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.93rem',
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    {formatDate(tweet.created_at)}
                </div>

                {/* Stats */}
                {likeCount > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 20,
                        padding: '12px 0',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '0.93rem',
                    }}>
                        <span>
                            <strong>{likeCount}</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {likeCount === 1 ? 'Like' : 'Likes'}
                            </span>
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <button className="tweet-action-btn">
                        <MessageCircle className="action-icon" />
                    </button>
                    <button className="tweet-action-btn">
                        <Repeat2 className="action-icon" />
                    </button>
                    <button
                        className={`tweet-action-btn ${liked ? 'liked' : ''} ${likeAnim ? 'like-pop' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart className="action-icon" fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button className="tweet-action-btn">
                        <Share className="action-icon" />
                    </button>
                </div>
            </div>

            {/* Delete confirm modal */}
            {showDelete && (
                <div className="modal-overlay" onClick={() => setShowDelete(false)}>
                    <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-title">Delete Tweet?</div>
                        <div className="confirm-text">
                            This can't be undone and it will be removed from your profile and the timeline.
                        </div>
                        <div className="confirm-btns">
                            <button className="confirm-delete-btn" onClick={handleDelete}>Delete</button>
                            <button className="confirm-cancel-btn" onClick={() => setShowDelete(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

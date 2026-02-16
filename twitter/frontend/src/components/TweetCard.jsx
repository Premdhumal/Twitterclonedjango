import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { tweetAPI } from '../api';
import { useAuth } from '../App';

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TweetCard({ tweet, onDelete }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(tweet.is_liked);
    const [likeCount, setLikeCount] = useState(tweet.like_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);

    const isOwner = user && tweet.user?.id === user.id;
    const hasImage = !!tweet.photo_url;

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return navigate('/login');
        try {
            const data = await tweetAPI.like(tweet.id);
            setLiked(data.liked);
            setLikeCount(data.like_count);
            if (data.liked) {
                setLikeAnim(true);
                setTimeout(() => setLikeAnim(false), 300);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onDelete) onDelete(tweet.id);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        navigate(`/tweet/${tweet.id}/edit`);
    };

    return (
        <article
            className={`tweet-card ${hasImage ? 'tweet-card-media' : ''}`}
            onClick={() => navigate(`/tweet/${tweet.id}`)}
        >
            {/* Avatar */}
            <div className="tweet-card-left">
                <div className="avatar" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${tweet.user?.username}`);
                }}>
                    {tweet.user?.username?.[0]?.toUpperCase()}
                </div>
            </div>

            {/* Body */}
            <div className="tweet-body">
                <div className="tweet-header">
                    <span
                        className="tweet-author"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user?.username}`); }}
                    >
                        {tweet.user?.display_name || tweet.user?.username}
                    </span>
                    <span className="tweet-handle">@{tweet.user?.username}</span>
                    <span className="tweet-time">· {timeAgo(tweet.created_at)}</span>
                </div>

                {/* Text */}
                <div className="tweet-text">{tweet.text}</div>

                {/* Image */}
                {hasImage && (
                    <div className="tweet-image">
                        <img src={tweet.photo_url} alt="" loading="lazy" />
                    </div>
                )}

                {/* Actions bar */}
                <div className="tweet-actions-bar">
                    <button className="tweet-action-btn" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle className="action-icon" />
                    </button>
                    <button className="tweet-action-btn" onClick={(e) => e.stopPropagation()}>
                        <Repeat2 className="action-icon" />
                    </button>
                    <button
                        className={`tweet-action-btn ${liked ? 'liked' : ''} ${likeAnim ? 'like-pop' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart className="action-icon" fill={liked ? 'currentColor' : 'none'} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </button>
                    <button className="tweet-action-btn" onClick={(e) => e.stopPropagation()}>
                        <Share className="action-icon" />
                    </button>
                </div>
            </div>

            {/* More menu */}
            {isOwner && (
                <>
                    <button
                        className="tweet-more-btn"
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {showMenu && (
                        <div className="tweet-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button className="tweet-dropdown-item" onClick={handleEdit}>
                                <Pencil size={18} /> Edit tweet
                            </button>
                            <button className="tweet-dropdown-item danger" onClick={handleDelete}>
                                <Trash2 size={18} /> Delete tweet
                            </button>
                        </div>
                    )}
                </>
            )}
        </article>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { notifAPI } from '../api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await notifAPI.list();
                setNotifications(data.notifications);
                // Mark all as read
                if (data.unread_count > 0) {
                    await notifAPI.markRead();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getIcon = (verb) => {
        switch (verb) {
            case 'like':
                return <Heart size={24} fill="#f91880" color="#f91880" />;
            default:
                return <Heart size={24} color="var(--accent-blue)" />;
        }
    };

    const getVerb = (verb) => {
        switch (verb) {
            case 'like': return 'liked your tweet';
            case 'reply': return 'replied to your tweet';
            case 'follow': return 'followed you';
            default: return verb;
        }
    };

    return (
        <>
            <div className="page-header">
                <h2>Notifications</h2>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <h3>Nothing to see here</h3>
                    <p>Likes, replies, and other interactions will show up here.</p>
                </div>
            ) : (
                notifications.map(n => (
                    <div
                        key={n.id}
                        className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                        onClick={() => n.tweet && navigate(`/tweet/${n.tweet}`)}
                        style={{ cursor: n.tweet ? 'pointer' : 'default' }}
                    >
                        <div className="notif-icon-wrap">
                            {getIcon(n.verb)}
                        </div>
                        <div className="notif-content">
                            <div style={{ marginBottom: 4 }}>
                                <div
                                    className="avatar avatar-sm"
                                    style={{ display: 'inline-flex', marginRight: 8, verticalAlign: 'middle' }}
                                >
                                    {n.actor?.username?.[0]?.toUpperCase()}
                                </div>
                                <strong
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${n.actor?.username}`); }}
                                >
                                    {n.actor?.display_name || n.actor?.username}
                                </strong>
                            </div>
                            <div className="notif-text">
                                {getVerb(n.verb)}
                            </div>
                            {n.tweet_text && (
                                <div className="notif-tweet-preview">
                                    {n.tweet_text}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </>
    );
}

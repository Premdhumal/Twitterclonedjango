import { useState, useEffect, useCallback } from 'react';
import { tweetAPI } from '../api';
import { useAuth } from '../App';
import TweetCard from '../components/TweetCard';
import ComposeTweet from '../components/ComposeTweet';

export default function Feed() {
    const { user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    const fetchTweets = useCallback(async () => {
        try {
            const data = await tweetAPI.list();
            setTweets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTweets();
    }, [fetchTweets]);

    // Listen for compose open event from sidebar
    useEffect(() => {
        const handler = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        window.addEventListener('open-compose', handler);
        return () => window.removeEventListener('open-compose', handler);
    }, []);

    const handleDelete = async (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await tweetAPI.delete(deleteId);
            setTweets(prev => prev.filter(t => t.id !== deleteId));
        } catch (err) {
            console.error(err);
        }
        setDeleteId(null);
    };

    return (
        <>
            {/* Page header */}
            <div className="page-header">
                <h2>Home</h2>
            </div>

            {/* Compose */}
            {user && (
                <ComposeTweet onTweetCreated={fetchTweets} />
            )}

            {/* Feed */}
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            ) : tweets.length === 0 ? (
                <div className="empty-state">
                    <h3>Welcome to DjangoTweet</h3>
                    <p>No tweets yet. Be the first to tweet something!</p>
                </div>
            ) : (
                tweets.map(tweet => (
                    <TweetCard
                        key={tweet.id}
                        tweet={tweet}
                        onDelete={handleDelete}
                    />
                ))
            )}

            {/* Delete confirm modal */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-title">Delete Tweet?</div>
                        <div className="confirm-text">
                            This can't be undone and it will be removed from your profile and the timeline.
                        </div>
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

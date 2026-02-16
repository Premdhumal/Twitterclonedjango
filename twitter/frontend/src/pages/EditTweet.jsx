import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, X, Save } from 'lucide-react';
import { tweetAPI } from '../api';
import { useAuth } from '../App';

export default function EditTweet() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tweet, setTweet] = useState(null);
    const [text, setText] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [existingPhoto, setExistingPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef();
    const textareaRef = useRef();

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                const data = await tweetAPI.detail(id);
                // Only the owner can edit
                if (!user || data.user?.id !== user.id) {
                    navigate('/feed');
                    return;
                }
                setTweet(data);
                setText(data.text || '');
                setExistingPhoto(data.photo_url || null);
            } catch {
                navigate('/feed');
            } finally {
                setLoading(false);
            }
        };
        fetchTweet();
    }, [id, user, navigate]);

    useEffect(() => {
        if (!loading && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [loading]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
            setExistingPhoto(null);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const removeExistingPhoto = () => {
        setExistingPhoto(null);
    };

    const handleSave = async () => {
        if (!text.trim()) {
            setError('Tweet cannot be empty');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('text', text);
            if (photo) formData.append('photo', photo);
            await tweetAPI.update(id, formData);
            navigate(`/tweet/${id}`);
        } catch (err) {
            setError(err.message || 'Failed to save changes');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Edit Tweet</h2>
                </div>
                <div className="loading-spinner"><div className="spinner"></div></div>
            </>
        );
    }

    if (!tweet) return null;

    const charCount = text.length;
    const charPercent = (charCount / 280) * 100;

    return (
        <>
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Edit Tweet</h2>
                <button
                    className="compose-submit-btn"
                    style={{ marginLeft: 'auto' }}
                    onClick={handleSave}
                    disabled={saving || !text.trim()}
                >
                    {saving ? 'Saving...' : <><Save size={16} style={{ marginRight: 6 }} /> Save</>}
                </button>
            </div>

            <div className="edit-page">
                {error && (
                    <div className="auth-error" style={{ margin: '16px 16px 0' }}>{error}</div>
                )}

                {/* Author info */}
                <div className="edit-author">
                    <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                            {user.display_name || user.username}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            @{user.username}
                        </div>
                    </div>
                </div>

                {/* Text editor */}
                <div className="edit-body">
                    <textarea
                        ref={textareaRef}
                        className="edit-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={280}
                        placeholder="What's on your mind?"
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />

                    {/* Character counter */}
                    <div className="edit-char-counter">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <circle
                                cx="12" cy="12" r="10"
                                fill="none"
                                stroke="var(--border-color)"
                                strokeWidth="2"
                            />
                            <circle
                                cx="12" cy="12" r="10"
                                fill="none"
                                stroke={charPercent > 90 ? 'var(--accent-red)' : charPercent > 70 ? 'var(--accent-amber)' : 'var(--accent-violet)'}
                                strokeWidth="2"
                                strokeDasharray={`${charPercent * 0.628} 62.8`}
                                strokeLinecap="round"
                                transform="rotate(-90 12 12)"
                                style={{ transition: 'stroke-dasharray 0.2s' }}
                            />
                        </svg>
                        <span style={{
                            fontSize: '0.78rem',
                            color: charPercent > 90 ? 'var(--accent-red)' : 'var(--text-tertiary)',
                        }}>
                            {280 - charCount}
                        </span>
                    </div>
                </div>

                {/* Image section */}
                <div className="edit-media-section">
                    <div className="edit-media-label">
                        <Image size={18} style={{ color: 'var(--accent-violet)' }} />
                        <span>Media</span>
                    </div>

                    {/* Existing photo */}
                    {existingPhoto && (
                        <div className="edit-media-preview">
                            <img src={existingPhoto} alt="Current" />
                            <button className="edit-media-remove" onClick={removeExistingPhoto}>
                                <X size={16} /> Remove
                            </button>
                        </div>
                    )}

                    {/* New photo preview */}
                    {preview && (
                        <div className="edit-media-preview">
                            <img src={preview} alt="New upload" />
                            <button className="edit-media-remove" onClick={removePhoto}>
                                <X size={16} /> Remove
                            </button>
                        </div>
                    )}

                    {/* Upload button */}
                    {!existingPhoto && !preview && (
                        <button className="edit-upload-btn" onClick={() => fileRef.current?.click()}>
                            <Image size={22} />
                            <span>Add an image</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                                JPG, PNG, GIF up to 5MB
                            </span>
                        </button>
                    )}

                    {(existingPhoto || preview) && (
                        <button
                            className="edit-change-btn"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Image size={16} /> Change image
                        </button>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </>
    );
}

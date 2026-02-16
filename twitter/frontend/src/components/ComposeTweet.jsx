import { useState, useRef, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import { tweetAPI } from '../api';
import { useAuth } from '../App';

export default function ComposeTweet({ onTweetCreated, editTweet, onCancelEdit }) {
    const { user } = useAuth();
    const [text, setText] = useState(editTweet?.text || '');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();
    const textareaRef = useRef();

    // Sync text when editTweet changes
    useEffect(() => {
        if (editTweet) {
            setText(editTweet.text || '');
            // Focus & scroll to compose box
            setTimeout(() => {
                textareaRef.current?.focus();
                textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            setText('');
        }
    }, [editTweet]);

    if (!user) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!text.trim() && !photo) return;
        setLoading(true);
        try {
            if (editTweet) {
                const formData = new FormData();
                formData.append('text', text);
                if (photo) formData.append('photo', photo);
                await tweetAPI.update(editTweet.id, formData);
            } else {
                const formData = new FormData();
                formData.append('text', text);
                if (photo) formData.append('photo', photo);
                await tweetAPI.create(formData);
            }
            setText('');
            removePhoto();
            if (onTweetCreated) onTweetCreated();
            if (onCancelEdit) onCancelEdit();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`compose-box ${editTweet ? 'compose-editing' : ''}`}>
            <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
            <div className="compose-input">
                {editTweet && (
                    <div style={{
                        fontSize: '0.8rem', color: 'var(--accent-cyan)',
                        fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px',
                    }}>
                        ✏️ Editing tweet
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    className="compose-textarea"
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={280}
                    rows={editTweet ? 3 : 1}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />

                {preview && (
                    <div className="compose-preview">
                        <img src={preview} alt="preview" />
                        <button className="compose-preview-remove" onClick={removePhoto}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="compose-actions">
                    <div className="compose-tools">
                        <button
                            className="compose-tool-btn"
                            onClick={() => fileRef.current?.click()}
                            title="Add photo"
                        >
                            <Image size={20} />
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {editTweet && (
                            <button
                                style={{
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                }}
                                onClick={onCancelEdit}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            className="compose-submit-btn"
                            onClick={handleSubmit}
                            disabled={loading || (!text.trim() && !photo)}
                        >
                            {loading ? '...' : editTweet ? 'Save Changes' : 'Tweet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

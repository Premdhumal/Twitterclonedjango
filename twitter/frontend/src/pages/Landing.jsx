import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, Heart } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Floating decorative orbs */}
            <div style={{
                position: 'absolute', top: '15%', left: '10%',
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent-cyan)', boxShadow: '0 0 20px var(--accent-cyan)',
                animation: 'float 6s ease-in-out infinite',
                opacity: 0.6,
            }} />
            <div style={{
                position: 'absolute', top: '30%', right: '15%',
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--accent-pink)', boxShadow: '0 0 15px var(--accent-pink)',
                animation: 'float 8s ease-in-out infinite reverse',
                opacity: 0.5,
            }} />
            <div style={{
                position: 'absolute', bottom: '25%', left: '20%',
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--accent-violet)', boxShadow: '0 0 15px var(--accent-violet)',
                animation: 'float 7s ease-in-out infinite',
                opacity: 0.4,
            }} />

            <div className="landing-content">
                {/* Logo */}
                <div className="landing-logo">
                    <Sparkles size={36} />
                </div>

                {/* Title */}
                <h1 className="landing-title">DjangoTweet</h1>

                {/* Subtitle */}
                <p className="landing-subtitle">
                    A vibrant social platform where ideas glow. Share your thoughts,
                    connect with minds, and light up the feed.
                </p>

                {/* Feature pills */}
                <div style={{
                    display: 'flex', gap: 12, justifyContent: 'center',
                    flexWrap: 'wrap', marginBottom: 40,
                }}>
                    {[
                        { icon: <MessageCircle size={14} />, text: 'Share Thoughts' },
                        { icon: <Heart size={14} />, text: 'Like & Connect' },
                        { icon: <Sparkles size={14} />, text: 'Glow Up Feed' },
                    ].map((f, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: 'var(--radius-full)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem', fontWeight: 500,
                        }}>
                            {f.icon} {f.text}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <button className="landing-cta" onClick={() => navigate('/feed')}>
                    Enter the Feed <ArrowRight size={20} />
                </button>
            </div>

            {/* Credit */}
            <div className="landing-credit">
                Project by <strong>Prem Dhumal</strong>
            </div>
        </div>
    );
}

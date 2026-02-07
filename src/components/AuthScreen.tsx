import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer } from 'lucide-react';

interface AuthScreenProps {
    onSignIn: (email: string, password: string) => Promise<{ error: any }>;
    onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export const AuthScreen = ({ onSignIn, onSignUp }: AuthScreenProps) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = isSignUp
            ? await onSignUp(email, password)
            : await onSignIn(email, password);

        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <Timer className="w-10 h-10 text-primary" />
                    <h1 className="font-display text-2xl font-bold gradient-text">FastTrack</h1>
                    <p className="text-sm text-muted-foreground">
                        {isSignUp ? 'Create your account' : 'Sign in to continue'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>

                {/* Toggle sign in / sign up */}
                <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        className="text-primary hover:underline"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </main>
    );
};
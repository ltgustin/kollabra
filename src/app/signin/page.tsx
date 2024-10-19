'use client';

import SignIn from '@/components/SignIn';
import { useAuth } from '../../hooks/useAuth';

const SignInPage = () => {
    const { loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator
    }

    return (
        <div>
            <h1>Sign in with Twitter/X</h1>
            <SignIn />
        </div>
    );
}

export default SignInPage;

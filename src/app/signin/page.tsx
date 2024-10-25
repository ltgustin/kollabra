'use client';

import SignIn from '@/components/SignIn';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

const SignInPage = () => {
    useAuthRedirect("/dashboard");

    return (
        <div>
            <h1>Sign in with Twitter/X</h1>
            <SignIn />
        </div>
    );
}

export default SignInPage;

import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-slate-900 pt-6 sm:justify-center sm:pt-0">
            <Link href="/" className="mb-6">
                <ApplicationLogo className="h-16 w-16 fill-current text-indigo-500 dark:text-indigo-400" />
            </Link>

            <div className="w-full bg-white dark:bg-slate-800 px-8 py-6 shadow-sm border border-slate-200 dark:border-slate-700 sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}

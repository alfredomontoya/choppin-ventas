import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    required = false,
    optional = false,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; required?: boolean; optional?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block text-sm text-slate-700 dark:text-slate-300 ` +
                (required ? 'font-semibold ' : 'font-medium ') +
                className
            }
        >
            {value ? value : children}
            {required && (
                <span className="ml-1.5 text-xs font-normal text-red-500 dark:text-red-400 italic">
                    (Obligatorio)
                </span>
            )}
            {!required && optional && (
                <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500 italic">
                    (Opcional)
                </span>
            )}
        </label>
    );
}

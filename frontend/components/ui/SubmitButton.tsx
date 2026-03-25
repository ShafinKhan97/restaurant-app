import { FaSpinner } from 'react-icons/fa';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  label: string;
  loadingLabel?: string;
}

export default function SubmitButton({ loading, label, loadingLabel, className, type = "submit", ...props }: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-brand-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin w-4 h-4" />
          {loadingLabel && <span>{loadingLabel}</span>}
        </>
      ) : (
        label
      )}
    </button>
  );
}

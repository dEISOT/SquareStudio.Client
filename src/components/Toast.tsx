import { Icon } from './Icon';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="toast">
      <Icon name="check" size={16} />
      <span>{message}</span>
    </div>
  );
}

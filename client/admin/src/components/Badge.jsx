import './Badge.css';

const TONE_CLASS = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  neutral: 'badge badge-neutral',
};

export default function Badge({ tone = 'neutral', children }) {
  return <span className={TONE_CLASS[tone] || TONE_CLASS.neutral}>{children}</span>;
}

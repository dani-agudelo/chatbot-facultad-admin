import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  wrapClassName?: string;
};

export function BrandLogo({ src, alt, wrapClassName = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const url = src.trim();

  if (!url || failed) {
    return (
      <div className="brand-mark" aria-hidden>
        FI
      </div>
    );
  }

  return (
    <div className={`brand-logo-wrap${wrapClassName ? ` ${wrapClassName}` : ''}`}>
      <img className="brand-logo" src={url} alt={alt} onError={() => setFailed(true)} />
    </div>
  );
}

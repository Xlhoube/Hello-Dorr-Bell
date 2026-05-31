interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  variant?: 'light' | 'dark' | 'white';
}

export function Logo({ className = '', size = 'md', showLabel = true, variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-1.5',
      box: 'w-5 h-5 rounded-md text-[8px]',
      text: 'text-base'
    },
    md: {
      container: 'gap-2',
      box: 'w-8 h-8 rounded-lg text-xs',
      text: 'text-xl'
    },
    lg: {
      container: 'gap-3',
      box: 'w-12 h-12 rounded-xl text-lg',
      text: 'text-3xl'
    },
    xl: {
      container: 'gap-4',
      box: 'w-20 h-20 rounded-[1.5rem] text-3xl',
      text: 'text-5xl'
    }
  };

  const currentSize = sizeClasses[size];
  
  const textColor = variant === 'white' ? 'text-white' : 'text-[var(--text-primary)]';

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Icon Box */}
      <div className={`${currentSize.box} bg-[#4F46E5] flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20`}>
        h
      </div>
      
      {/* Text */}
      <span className={`font-black tracking-tight ${textColor} ${currentSize.text}`}>
        hello
      </span>
    </div>
  );
}

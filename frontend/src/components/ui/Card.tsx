import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export const Card = ({ children, className = '', hover = false, style }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-xl hover:scale-105' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

declare module 'react-sparklines' {
  import * as React from 'react';

  export interface SparklinesProps extends React.SVGProps<SVGElement> {
    data: number[];
    width?: number;
    height?: number;
    margin?: number;
    limit?: number;
    children?: React.ReactNode; // allow <SparklinesLine /> as child
  }

  export interface SparklinesLineProps extends React.SVGProps<SVGElement> {
    color?: string;
    style?: React.CSSProperties;
  }

  export const Sparklines: React.FC<SparklinesProps>;
  export const SparklinesLine: React.FC<SparklinesLineProps>;
}
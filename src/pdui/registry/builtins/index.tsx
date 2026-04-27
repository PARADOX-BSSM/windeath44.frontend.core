import type { CSSProperties } from 'react';
import { defaultRegistry } from '../ComponentRegistry';

function Button({ label, variant = 'default', disabled, style, onClick }: {
  id?: string; label: string; variant?: string; disabled?: boolean; style?: CSSProperties; onClick?: () => void;
}) {
  return <button data-pdui-widget="Button" data-variant={variant} disabled={disabled} style={style} onClick={onClick}>{label}</button>;
}

function Label({ text, variant = 'body', style }: {
  id?: string; text: string; variant?: string; style?: CSSProperties;
}) {
  return <span data-pdui-widget="Label" data-variant={variant} style={style}>{text}</span>;
}

function TextInput({ id, placeholder, value, disabled, style, onChange }: {
  id?: string; placeholder?: string; value?: string; disabled?: boolean; style?: CSSProperties; onChange?: (v: string) => void;
}) {
  return <input data-pdui-widget="TextInput" id={id} placeholder={placeholder} defaultValue={value} disabled={disabled} style={style} onChange={(e) => onChange?.(e.target.value)} />;
}

function Container({ layout = 'vertical', gap = 0, padding = 0, columns, style, children }: {
  id?: string; layout?: 'vertical' | 'horizontal' | 'grid'; gap?: number; padding?: number; columns?: number; style?: CSSProperties; children?: React.ReactNode;
}) {
  const display = layout === 'grid' ? 'grid' : 'flex';
  const flexDir = layout === 'horizontal' ? 'row' : 'column';
  const gridCols = layout === 'grid' && columns ? `repeat(${columns}, 1fr)` : undefined;
  return (
    <div data-pdui-widget="Container" style={{ display, flexDirection: flexDir, gap, padding, gridTemplateColumns: gridCols, ...style }}>
      {children}
    </div>
  );
}

function List({ items = [], style }: {
  id?: string; items?: string[]; style?: CSSProperties;
}) {
  return <ul data-pdui-widget="List" style={style}>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

function Image({ src, alt = '', style }: {
  id?: string; src?: string; alt?: string; style?: CSSProperties;
}) {
  return <img data-pdui-widget="Image" src={src} alt={alt} style={style} />;
}

function Checkbox({ id, label, checked, disabled, onChange }: {
  id?: string; label?: string; checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <label data-pdui-widget="Checkbox">
      <input type="checkbox" id={id} checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      {label}
    </label>
  );
}

function Select({ id, options = [], value, disabled, onChange }: {
  id?: string; options?: { value: string; label: string }[]; value?: string; disabled?: boolean; onChange?: (v: string) => void;
}) {
  return (
    <select data-pdui-widget="Select" id={id} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

import type React from 'react';
import type { ComponentType } from 'react';

const builtins: [string, ComponentType<Record<string, unknown>>][] = [
  ['Button', Button as ComponentType<Record<string, unknown>>],
  ['Label', Label as ComponentType<Record<string, unknown>>],
  ['TextInput', TextInput as ComponentType<Record<string, unknown>>],
  ['Container', Container as ComponentType<Record<string, unknown>>],
  ['List', List as ComponentType<Record<string, unknown>>],
  ['Image', Image as ComponentType<Record<string, unknown>>],
  ['Checkbox', Checkbox as ComponentType<Record<string, unknown>>],
  ['Select', Select as ComponentType<Record<string, unknown>>],
];

builtins.forEach(([name, comp]) => defaultRegistry.register(name, comp));

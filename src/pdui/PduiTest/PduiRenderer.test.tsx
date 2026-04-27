import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PduiParser } from '../parser/PduiParser';
import { PduiRenderer } from '../renderer/PduiRenderer';
import type { PduiDocument } from '../schema/types';

function makeDoc(root: object): PduiDocument {
  return PduiParser.parse(JSON.stringify({ version: 1, meta: { title: 'T' }, root }));
}

describe('PduiRenderer', () => {
  it('renders a Button widget', () => {
    const doc = makeDoc({ type: 'Button', props: { label: 'Submit' } });
    render(<PduiRenderer document={doc} />);
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('calls onClick handler via events', () => {
    const onClick = vi.fn();
    const doc = makeDoc({ type: 'Button', props: { label: 'Go' }, events: { onClick: 'handlers.onGo' } });
    render(<PduiRenderer document={doc} handlers={{ onGo: onClick }} />);
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders unknown type as fallback div in non-prod', () => {
    const doc = makeDoc({ type: 'UnknownWidget', props: { label: 'x' } });
    const { container } = render(<PduiRenderer document={doc} />);
    expect(container.querySelector('[data-pdui-unknown-type="UnknownWidget"]')).toBeTruthy();
  });

  it('renders nested children recursively', () => {
    const doc = makeDoc({
      type: 'Container',
      props: { layout: 'vertical' },
      children: [
        { type: 'Label', props: { text: 'Child 1' } },
        { type: 'Label', props: { text: 'Child 2' } },
      ],
    });
    render(<PduiRenderer document={doc} />);
    expect(screen.getByText('Child 1')).toBeTruthy();
    expect(screen.getByText('Child 2')).toBeTruthy();
  });

  it('renders Label widget with text', () => {
    const doc = makeDoc({ type: 'Label', props: { text: 'Hello world' } });
    render(<PduiRenderer document={doc} />);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });
});

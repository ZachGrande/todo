import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Directly exercise the modifier that is wired into DndContext (see TodoList.test.jsx for wiring).
// restrictToVerticalAxis is what prevents the page from expanding horizontally during a drag.

// Arguments shape that dnd-kit passes to every modifier at runtime
const modifierArgs = {
  transform: null,
  active: null,
  over: null,
  activeNodeRect: null,
  draggingNodeRect: null,
  overlappingRect: null,
  rects: null,
  windowRect: null,
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  activatorEvent: null,
};

describe('restrictToVerticalAxis modifier — prevents horizontal page overflow during drag', () => {
  it('zeroes out x-translation when dragged far to the right edge of the screen', () => {
    // Simulate pointer having moved 2000px to the right and 50px down
    const result = restrictToVerticalAxis({
      ...modifierArgs,
      transform: { x: 2000, y: 50, scaleX: 1, scaleY: 1 },
    });

    expect(result.x).toBe(0);   // must not expand the page horizontally
    expect(result.y).toBe(50);  // vertical movement is preserved
  });

  it('zeroes out x-translation when dragged far to the left edge of the screen', () => {
    const result = restrictToVerticalAxis({
      ...modifierArgs,
      transform: { x: -2000, y: -30, scaleX: 1, scaleY: 1 },
    });

    expect(result.x).toBe(0);
    expect(result.y).toBe(-30);
  });

  it('preserves zero x-translation when dragging only vertically', () => {
    const result = restrictToVerticalAxis({
      ...modifierArgs,
      transform: { x: 0, y: 120, scaleX: 1, scaleY: 1 },
    });

    expect(result.x).toBe(0);
    expect(result.y).toBe(120);
  });
});



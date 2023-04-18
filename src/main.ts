import { assign, createMachine, interpret } from 'xstate';

const dragDropMachine = createMachine({
  predictableActionArguments: true,
  initial: 'idle',
  context: {
    // position of the box
    x: 0,
    y: 0,
    // where you clicked
    pointerx: 0,
    pointery: 0,
    // how far from where you clicked
    dx: 0,
    dy: 0,
  },
  states: {
    idle: {
      on: {
        mousedown: {
          target: 'dragging',
          actions: assign((context, event: MouseEvent) => ({
            ...context,
            pointerx: event.clientX,
            pointery: event.clientY,
          })),
        },
      },
    },
    dragging: {
      on: {
        mousemove: {
          target: 'dragging',
          actions: assign((context, event: MouseEvent) => ({
            ...context,
            dx: event.clientX - context.pointerx,
            dy: event.clientY - context.pointery,
          })),
        },
        mouseup: {
          target: 'idle',
          actions: assign(context => ({
            ...context,
            x: context.x + context.dx,
            y: context.y + context.dy,
            dx: 0,
            dy: 0,
          })),
        },
      },
    },
  },
});

const body = document.body;
const box = document.getElementById('box');

const dragDropService = interpret(dragDropMachine)
  .onTransition(state => {
    if (state.changed) {
      box?.style.setProperty('left', `${state.context.x + state.context.dx}px`);
      box?.style.setProperty('top', `${state.context.y + state.context.dy}px`);
      body.dataset.state = state.toStrings().join(' ');
    }
  })
  .start();

box?.addEventListener('mousedown', event => {
  dragDropService.send({ type: 'mousedown', ...toEvent(event) });
});

body.addEventListener('mouseup', () => {
  dragDropService.send({ type: 'mouseup' });
});

body.addEventListener('mousemove', event => {
  dragDropService.send({ type: 'mousemove', ...toEvent(event) });
});

function toEvent({ clientX, clientY }: MouseEvent) {
  return { clientX, clientY };
}

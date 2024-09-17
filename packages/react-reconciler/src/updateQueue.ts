import { Action } from 'shared/ReactTypes';
import { FiberNode } from './fiber';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>
) => {
	updateQueue.shared.pending = update;
};

export const createUpdateQueue = <Action>() => {
	const updateQueue: UpdateQueue<Action> = {
		shared: {
			pending: null
		}
	};
	return updateQueue;
};

export const initializeUpdateQueue = (fiber: FiberNode) => {
	fiber.updateQueue = {
		shared: {
			pending: null
		}
	};
};

export const processUpdateQueue = <State>(fiber: FiberNode) => {
	const updateQueue = fiber.updateQueue as UpdateQueue<State>;
	let newState = fiber.memoizedState;
	if (updateQueue) {
		const pending = updateQueue.shared.pending;
		console.log(889, pending?.action);
		const pendingUpdate = pending;
		updateQueue.shared.pending = null;

		if (pendingUpdate !== null) {
			const action = pendingUpdate.action;
			if (action instanceof Function) {
				console.log(888, fiber, action);
				newState = action(newState);
			} else {
				newState = action;
			}
		}
	} else {
		console.log(123);
	}
	fiber.memoizedState = newState;
};

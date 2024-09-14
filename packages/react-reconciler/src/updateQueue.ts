import { FiberNode } from './fiber';

type UpdateAction = any;

export interface Update {
	action: UpdateAction;
}

export interface UpdateQueue {
	shared: {
		pending: Update | null;
	};
}

export const createUpdate = (action: any): Update => {
	return {
		action
	};
};

export const enqueueUpdate = (fiber: FiberNode, update: Update) => {
	if (fiber.updateQueue) {
		fiber.updateQueue.shared.pending = update;
	}
};

export const initializeUpdateQueue = (fiber: FiberNode) => {
	fiber.updateQueue = {
		shared: {
			pending: null
		}
	};
};

export const processUpdateQueue = (fiber: FiberNode) => {
	const updateQueue = fiber.updateQueue;
	let newState = null;
	if (updateQueue) {
		const pending = updateQueue.shared.pending;
		const pendingUpdate = pending;
		updateQueue.shared.pending = null;

		if (pendingUpdate !== null) {
			const action = pendingUpdate.action;
			if (typeof action === 'function') {
				newState = action();
			} else {
				newState = action;
			}
		}
	} else {
		console.log(123);
	}
	fiber.memoizedState = newState;
};

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

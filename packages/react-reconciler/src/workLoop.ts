import { FiberNode, FiberRootNode } from './fiber';
import { WorkTag } from './workTags';

class WorkLoop {
	workInProgress: FiberNode | null;
	constructor() {
		this.workInProgress = null;
	}

	scheduleUpdateOnFiber(fiber: FiberNode) {
		const root = this.markUpdateLaneFromFiberToRoot(fiber);

		this.ensureRootIsScheduled(root);
	}

	markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
		let node = fiber;
		let parent = node._return;

		while (parent !== null) {
			node = parent;
			parent = node._return;
		}

		if (node.tag === WorkTag.HostRoot) {
			return node.stateNode;
		}

		return null;
	}

	ensureRootIsScheduled(root: FiberRootNode) {
		this.performSyncWorkOnRoot(root);
	}

	performSyncWorkOnRoot(root: FiberRootNode) {
		this.prepareFreshStack(root);

		// render
		do {
			try {
				this.workLoop();
				break;
			} catch (e) {
				this.workInProgress = null;
			}
		} while (true);

		console.log('render 结束', root);
	}

	prepareFreshStack(root: FiberRootNode) {
		const rootFiber = root.current as FiberNode;
		this.workInProgress = rootFiber.createWorkInProgress({});
	}

	workLoop() {
		while (this.workInProgress !== null) {
			this.performUnitOfWork(this.workInProgress);
		}
	}

	performUnitOfWork(fiber: FiberNode) {
		const next = beginWork(fiber);

		if (next === null) {
			this.workInProgress = null;
		} else {
			this.workInProgress = next;
		}
	}
}

export default WorkLoop;

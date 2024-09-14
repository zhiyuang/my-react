import { HostConfig } from './hostConfig';
import { beginWork } from './beginWork';
import { FiberNode, FiberRootNode } from './fiber';
import { WorkTag } from './workTags';
import { completeWork } from './completeWork';
import { Flags, MutationMask } from './fiberFlags';
import { commitMutationEffects } from './commitWork';

class WorkLoop {
	workInProgress: FiberNode | null;
	hostConfig: HostConfig;
	constructor(hostConfig: HostConfig) {
		this.workInProgress = null;
		this.hostConfig = hostConfig;
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

		console.log('render 结束', root, this.workInProgress);

		if (this.workInProgress !== null) {
			console.error('wip should be null');
		}

		const finishedWork = root.current === null ? null : root.current.alternate;
		root.finishedWork = finishedWork;

		this.commitRoot(root);
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
			// beginWork 阶段结束了，进入 completeWork 阶段
			this.completeUnitOfWork(fiber);
		} else {
			this.workInProgress = next;
		}
	}

	completeUnitOfWork(fiber: FiberNode) {
		let node: FiberNode | null = fiber;

		do {
			const next = completeWork(node, this.hostConfig);

			if (next !== null) {
				this.workInProgress = next;
				return;
			}

			const sibling = node?.sibling;
			if (sibling) {
				this.workInProgress = next;
				return;
			}
			node = node._return;
			this.workInProgress = node;
		} while (node !== null);
	}

	commitRoot(root: FiberRootNode) {
		const finishedWork = root.finishedWork;

		if (finishedWork === null) {
			return;
		}

		root.finishedWork = null;

		const subtreeHasEffect =
			(finishedWork.subtreeFlags & MutationMask) !== Flags.NoFlags;
		const rootHasEffect = (finishedWork.flags & MutationMask) !== Flags.NoFlags;

		if (subtreeHasEffect || rootHasEffect) {
			// 有副作用要执行

			// 阶段1/3:beforeMutation

			// 阶段2/3:Mutation
			commitMutationEffects(finishedWork, this.hostConfig);

			// Fiber Tree切换
			root.current = finishedWork;

			// 阶段3:Layout
		} else {
			root.current = finishedWork;
		}
	}
}

export default WorkLoop;

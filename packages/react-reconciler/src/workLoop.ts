import { beginWork } from './beginWork';
import { FiberNode, FiberRootNode } from './fiber';
import { WorkTag } from './workTags';
import { completeWork } from './completeWork';
import { Flags, MutationMask } from './fiberFlags';
import { commitMutationEffects } from './commitWork';

let workInProgress: FiberNode | null;

export const scheduleUpdateOnFiber = (fiber: FiberNode) => {
	const root = markUpdateLaneFromFiberToRoot(fiber);

	ensureRootIsScheduled(root);
};

export const markUpdateLaneFromFiberToRoot = (fiber: FiberNode) => {
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
};

export const ensureRootIsScheduled = (root: FiberRootNode) => {
	performSyncWorkOnRoot(root);
};

export const performSyncWorkOnRoot = (root: FiberRootNode) => {
	prepareFreshStack(root);

	// render
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			workInProgress = null;
		}
	} while (true);

	console.log('render 结束', root, workInProgress);

	if (workInProgress !== null) {
		console.error('wip should be null');
	}

	const finishedWork = root.current === null ? null : root.current.alternate;
	root.finishedWork = finishedWork;

	commitRoot(root);
};

export const prepareFreshStack = (root: FiberRootNode) => {
	const rootFiber = root.current as FiberNode;
	workInProgress = rootFiber.createWorkInProgress({});
};

export const workLoop = () => {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
};

export const performUnitOfWork = (fiber: FiberNode) => {
	const next = beginWork(fiber);

	if (next === null) {
		// beginWork 阶段结束了，进入 completeWork 阶段
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
};

export const completeUnitOfWork = (fiber: FiberNode) => {
	let node: FiberNode | null = fiber;

	do {
		const next = completeWork(node);

		if (next !== null) {
			workInProgress = next;
			return;
		}

		const sibling = node?.sibling;
		if (sibling) {
			workInProgress = sibling;
			return;
		}
		node = node._return;
		workInProgress = node;
	} while (node !== null);
};

export const commitRoot = (root: FiberRootNode) => {
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
		commitMutationEffects(finishedWork);

		// Fiber Tree切换
		root.current = finishedWork;

		// 阶段3:Layout
	} else {
		root.current = finishedWork;
	}
};

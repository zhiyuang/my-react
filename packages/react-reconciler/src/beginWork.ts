import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { WorkTag } from './workTags';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { mountChildFibers, reconcileChildFibers } from './childFiber';
import { renderWithHooks } from './fiberHooks';

export const beginWork = (workInProgress: FiberNode) => {
	console.log(222222222, workInProgress);
	switch (workInProgress.tag) {
		case WorkTag.HostRoot:
			return updateHostRoot(workInProgress);
		case WorkTag.HostComponent:
			return updateHostComponent(workInProgress);
		case WorkTag.FunctionComponent:
			return updateFunctionComponent(workInProgress);
		case WorkTag.HostText:
			return null;
		default:
			return null;
	}
};

const updateHostRoot = (workInProgress: FiberNode) => {
	const baseState = workInProgress.memoizedState;
	const updateQueue = workInProgress.updateQueue as UpdateQueue<Element>;
	workInProgress.memoizedState = processUpdateQueue(
		baseState,
		updateQueue,
		workInProgress
	);
	const nextChildren = workInProgress.memoizedState;
	console.log(5555555555, nextChildren);
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
};

const updateHostComponent = (workInProgress: FiberNode) => {
	const nextProps = workInProgress.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
};

const updateFunctionComponent = (workInProgress: FiberNode) => {
	const nextChildren = renderWithHooks(workInProgress);
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
};

const reconcileChildren = (
	workInProgress: FiberNode,
	children?: ReactElement
) => {
	const current = workInProgress.alternate;

	if (current !== null) {
		workInProgress.child = reconcileChildFibers(
			workInProgress,
			current.child,
			children
		);
	} else {
		workInProgress.child = mountChildFibers(workInProgress, null, children);
	}
};

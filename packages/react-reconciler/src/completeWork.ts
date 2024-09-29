import { updateFiberProps } from 'react-dom/src/SyntheticEvent';
import { FiberNode } from './fiber';
import { Flags } from './fiberFlags';
import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from './hostConfig';
import { WorkTag } from './workTags';

const appendAllChildren = (parent: any, workInProgress: FiberNode) => {
	let node = workInProgress.child;
	while (node !== null) {
		console.log(22, parent, node, workInProgress);
		if (node.tag === WorkTag.HostComponent || node.tag === WorkTag.HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			// 这里是什么原因
			node.child._return = node;
			node = node.child;
			continue;
		}

		if (node === workInProgress) {
			return;
		}

		while (node.sibling === null) {
			if (node._return === null || node._return === workInProgress) {
				return;
			}
			node = node?._return;
		}

		node.sibling._return = node._return;
		node = node.sibling;
	}
};

const bubbleProperties = (completeWork: FiberNode) => {
	let subtreeFlags = Flags.NoFlags;
	let child = completeWork.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child._return = completeWork;
		child = child.sibling;
	}

	completeWork.subtreeFlags |= subtreeFlags;
};

const markUpdate = (fiber: FiberNode) => {
	fiber.flags |= Flags.Update;
};

export const completeWork = (workInProgress: FiberNode) => {
	const newProps = workInProgress.pendingProps;
	const current = workInProgress.alternate;
	switch (workInProgress.tag) {
		case WorkTag.HostComponent:
			if (current !== null && workInProgress.stateNode) {
				// TODO 更新元素属性
				updateFiberProps(workInProgress.stateNode, newProps);
			} else {
				const instance = createInstance(workInProgress._type, newProps);
				appendAllChildren(instance, workInProgress);
				workInProgress.stateNode = instance;
			}

			bubbleProperties(workInProgress);
			return null;
		case WorkTag.HostRoot:
			bubbleProperties(workInProgress);
			return null;
		case WorkTag.HostText:
			if (current !== null && workInProgress.stateNode) {
				const oldText = current.memoizedProps?.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(workInProgress);
				}
			} else {
				const textInstance = createTextInstance(newProps.content);
				workInProgress.stateNode = textInstance;
			}
			bubbleProperties(workInProgress);
			return null;
		case WorkTag.FunctionComponent:
			bubbleProperties(workInProgress);
			return null;
		default:
			console.error('暂时还未处理');
			return null;
	}
};

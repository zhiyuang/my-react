import { FiberNode } from './fiber';
import { Flags } from './fiberFlags';
import { HostConfig } from './hostConfig';
import { WorkTag } from './workTags';

const appendAllChildren = (
	parent: any,
	workInProgress: FiberNode,
	hostConfig: HostConfig
) => {
	let node = workInProgress.child;
	while (node !== null) {
		console.log(22, parent, node, workInProgress);
		if (node.tag === WorkTag.HostComponent || node.tag === WorkTag.HostText) {
			hostConfig.appendInitialChild(parent, node.stateNode);
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

export const completeWork = (
	workInProgress: FiberNode,
	hostConfig: HostConfig
) => {
	const newProps = workInProgress.pendingProps;
	switch (workInProgress.tag) {
		case WorkTag.HostComponent:
			const instance = hostConfig.createInstance(workInProgress._type);

			appendAllChildren(instance, workInProgress, hostConfig);

			workInProgress.stateNode = instance;

			bubbleProperties(workInProgress);
			return null;
		case WorkTag.HostRoot:
			bubbleProperties(workInProgress);
			return null;
		case WorkTag.HostText:
			const textInstance = hostConfig.createTextInstance(newProps.content);
			workInProgress.stateNode = textInstance;
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

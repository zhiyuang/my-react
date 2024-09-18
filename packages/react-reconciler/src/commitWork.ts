import { FiberNode, FiberRootNode } from './fiber';
import { Flags, MutationMask } from './fiberFlags';
import { appendChildToContainer } from './hostConfig';
import { WorkTag } from './workTags';

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== Flags.NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect._return;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Flags.Placement) !== Flags.NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Flags.Placement;
	}
};

const commitPlacement = (finishedWork: FiberNode) => {
	const hostParent = getHostParent(finishedWork) as FiberNode;
	let parentStateNode;
	switch (hostParent.tag) {
		case WorkTag.HostRoot:
			parentStateNode = (hostParent.stateNode as FiberRootNode).container;
			break;
		case WorkTag.HostComponent:
			parentStateNode = hostParent.stateNode;
	}

	appendPlacementNodeIntoContainer(finishedWork, parentStateNode);
};

const appendPlacementNodeIntoContainer = (fiber: FiberNode, parent: any) => {
	if (fiber.tag === WorkTag.HostComponent || fiber.tag === WorkTag.HostText) {
		appendChildToContainer(fiber.stateNode, parent);
		return;
	}

	const child = fiber.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, parent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, parent);
			sibling = sibling.sibling;
		}
	}
};

const getHostParent = (fiber: FiberNode) => {
	let parent = fiber._return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === WorkTag.HostComponent || parentTag === WorkTag.HostRoot) {
			return parent;
		}
		parent = parent._return;
	}
	return fiber;
};

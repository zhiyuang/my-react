import { FiberNode, FiberRootNode } from './fiber';
import { Flags, MutationMask } from './fiberFlags';
import {
	appendChildToContainer,
	commitTextUpdate,
	Container,
	insertChildToContainer,
	Instance,
	removeChild
} from './hostConfig';
import { WorkTag } from './workTags';

let nextEffect: FiberNode | null = null;

const gethostSibling = (fiber: FiberNode) => {
	let node: FiberNode = fiber;

	findSibling: while (true) {
		while (node.sibling === null) {
			const parent = node._return;
			if (
				parent === null ||
				parent.tag === WorkTag.HostComponent ||
				parent.tag === WorkTag.HostRoot
			) {
				return null;
			}
			node = parent;
		}
		node.sibling._return = node._return;
		node = node.sibling;

		while (
			node.tag !== WorkTag.HostText &&
			node.tag !== WorkTag.HostComponent
		) {
			if ((node.flags & Flags.Placement) !== Flags.NoFlags) {
				continue findSibling;
			}
			if (node.child === null) {
				continue findSibling;
			} else {
				node.child._return = node;
				node = node.child;
			}
		}

		if ((node.flags & Flags.Placement) === Flags.NoFlags) {
			return node.stateNode;
		}
	}
};

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
	if ((flags & Flags.ChildDeletion) !== Flags.NoFlags) {
		const deletions = finishedWork.deletions;

		if (deletions !== null) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}
		finishedWork.flags &= ~Flags.ChildDeletion;
	}
	if ((flags & Flags.Update) !== Flags.NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Flags.Update;
	}
};

const commitUpdate = (finishedWork: FiberNode) => {
	switch (finishedWork.tag) {
		case WorkTag.HostText:
			const newContent = finishedWork.pendingProps.content;
			return commitTextUpdate(finishedWork.stateNode, newContent);
	}
	console.error('还没支持');
};

const commitPlacement = (finishedWork: FiberNode) => {
	const hostParent = getHostParent(finishedWork) as Container;

	const sibling = gethostSibling(finishedWork);

	insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
	// appendPlacementNodeIntoContainer(finishedWork, hostParent);
};

const insertOrAppendPlacementNodeIntoContainer = (
	fiber: FiberNode,
	parent: Container,
	before?: Instance
) => {
	if (fiber.tag === WorkTag.HostComponent || fiber.tag === WorkTag.HostText) {
		if (before) {
			insertChildToContainer(fiber.stateNode, parent, before);
		} else {
			appendChildToContainer(fiber.stateNode, parent);
		}
		return;
	}

	const child = fiber.child;
	if (child !== null) {
		insertOrAppendPlacementNodeIntoContainer(child, parent);
		let sibling = child.sibling;

		while (sibling !== null) {
			insertOrAppendPlacementNodeIntoContainer(sibling, parent);
			sibling = sibling.sibling;
		}
	}
};

const getHostParent = (fiber: FiberNode) => {
	let parent = fiber._return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === WorkTag.HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === WorkTag.HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent._return;
	}
	return fiber;
};

// TODO: 还没研究
/**
 * 删除需要考虑：
 * HostComponent：需要遍历他的子树，为后续解绑ref创造条件，HostComponent本身只需删除最上层节点即可
 * FunctionComponent：effect相关hook的执行，并遍历子树
 */
function commitDeletion(childToDelete: FiberNode) {
	let firstHostFiber: FiberNode;

	commitNestedUnmounts(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case WorkTag.HostComponent:
				if (!firstHostFiber) {
					firstHostFiber = unmountFiber;
				}
				// 解绑ref
				return;
			case WorkTag.HostText:
				if (!firstHostFiber) {
					firstHostFiber = unmountFiber;
				}
				return;
			case WorkTag.FunctionComponent:
				// effect相关操作
				return;
		}
	});

	// @ts-ignore
	if (firstHostFiber) {
		const hostParent = getHostParent(childToDelete) as Container;
		removeChild(firstHostFiber.stateNode, hostParent);
	}

	childToDelete._return = null;
	childToDelete.child = null;
}

function commitNestedUnmounts(
	root: FiberNode,
	onCommitUnmount: (unmountFiber: FiberNode) => void
) {
	let node = root;

	while (true) {
		onCommitUnmount(node);

		if (node.child !== null) {
			// 向下
			node.child._return = node;
			node = node.child;
			continue;
		}
		if (node === root) {
			// 终止条件
			return;
		}
		while (node.sibling === null) {
			// 向上
			if (node._return === null || node._return === root) {
				// 终止条件
				return;
			}
			node = node._return;
		}
		node.sibling._return = node._return;
		node = node.sibling;
	}
}
